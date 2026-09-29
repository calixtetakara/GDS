<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = Task::with([
            'project.interns.supervisor.user',
            'project.interns.user',
            'intern.user',
        ]);

        if ($user->hasRole('Stagiaire')) {
            $internId = $user->intern?->id;
            $tasks->whereHas('project.interns', fn ($q) => $q->where('interns.id', $internId));
        }

        if ($user->hasRole('Encadreur')) {
            $supervisorId = $user->supervisor?->id;
            if (! $supervisorId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $tasks->whereHas('project.interns', fn ($q) => $q->where('interns.supervisor_id', $supervisorId));
        }

        return response()->json(['success' => true, 'data' => $tasks->get()]);
    }

    public function show($id)
    {
        $task = Task::with([
            'project.interns.supervisor.user',
            'project.interns.user',
            'intern.user',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Encadreur')) {
            throw ValidationException::withMessages([
                'task' => ['Seul un encadreur peut créer une tâche.'],
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|string|max:50',
            'project_id' => 'required|exists:projects,id',
            'intern_id' => 'nullable|exists:interns,id',
        ]);

        $supervisorId = $user->supervisor?->id;
        if (! $supervisorId) {
            throw ValidationException::withMessages([
                'task' => ['Aucun profil encadreur associé à ce compte.'],
            ]);
        }

        $projetAutorise = Project::where('id', $validated['project_id'])
            ->whereHas('interns', fn ($q) => $q->where('supervisor_id', $supervisorId))
            ->exists();

        if (! $projetAutorise) {
            throw ValidationException::withMessages([
                'project_id' => ['Vous ne pouvez créer des tâches que sur vos propres projets.'],
            ]);
        }

        if (! empty($validated['intern_id'])) {
            $stagiaireDansProjet = Project::where('id', $validated['project_id'])
                ->whereHas('interns', fn ($q) => $q->where('interns.id', $validated['intern_id']))
                ->exists();

            if (! $stagiaireDansProjet) {
                throw ValidationException::withMessages([
                    'intern_id' => ['Ce stagiaire n\'est pas affecté à ce projet.'],
                ]);
            }
        }

        $task = Task::create($validated);
        $task->load([
            'project.interns.supervisor.user',
            'project.interns.user',
            'intern.user',
        ]);

        return response()->json(['success' => true, 'data' => $task], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        if (! $user->hasRole('Encadreur')) {
            throw ValidationException::withMessages([
                'task' => ['Seul un encadreur peut modifier une tâche.'],
            ]);
        }

        $supervisorId = $user->supervisor?->id;
        if (! $supervisorId) {
            throw ValidationException::withMessages([
                'task' => ['Aucun profil encadreur associé à ce compte.'],
            ]);
        }

        $tacheAutorisee = Task::where('id', $task->id)
            ->whereHas('project.interns', fn ($q) => $q->where('supervisor_id', $supervisorId))
            ->exists();

        if (! $tacheAutorisee) {
            throw ValidationException::withMessages([
                'task' => ['Vous ne pouvez modifier que les tâches de vos projets.'],
            ]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|string|max:50',
            'project_id' => 'sometimes|exists:projects,id',
            'intern_id' => 'nullable|exists:interns,id',
        ]);

        if (! empty($validated['intern_id'])) {
            $projetId = $validated['project_id'] ?? $task->project_id;
            $stagiaireDansProjet = Project::where('id', $projetId)
                ->whereHas('interns', fn ($q) => $q->where('interns.id', $validated['intern_id']))
                ->exists();

            if (! $stagiaireDansProjet) {
                throw ValidationException::withMessages([
                    'intern_id' => ['Ce stagiaire n\'est pas affecté à ce projet.'],
                ]);
            }
        }

        $task->update($validated);
        $task->load([
            'project.interns.supervisor.user',
            'project.interns.user',
            'intern.user',
        ]);

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        if (! $user->hasRole('Encadreur')) {
            throw ValidationException::withMessages([
                'task' => ['Seul un encadreur peut supprimer une tâche.'],
            ]);
        }

        $supervisorId = $user->supervisor?->id;
        $tacheAutorisee = Task::where('id', $task->id)
            ->whereHas('project.interns', fn ($q) => $q->where('supervisor_id', $supervisorId))
            ->exists();

        if (! $tacheAutorisee) {
            throw ValidationException::withMessages([
                'task' => ['Vous ne pouvez supprimer que les tâches de vos projets.'],
            ]);
        }

        $task->delete();

        return response()->json(['success' => true, 'message' => 'Tâche supprimée avec succès.']);
    }

    /**
     * Télécharge un modèle CSV à remplir pour l'import en masse.
     */
    public function downloadTemplate(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Encadreur')) {
            throw ValidationException::withMessages([
                'task' => ['Seul un encadreur peut télécharger ce modèle.'],
            ]);
        }

        $filename = 'modele-taches-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ];

        $callback = function () {
            $output = fopen('php://output', 'w');
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($output, [
                'nom_tache',
                'projet',
                'stagiaire_email',
                'statut',
                'date_debut',
                'date_fin',
            ], ';');

            fputcsv($output, [
                'Développer la page de connexion',
                'Refonte du site web',
                'jean.dupont@example.com',
                'À faire',
                '2026-10-01',
                '2026-10-15',
            ], ';');

            fputcsv($output, [
                'Corriger les bugs du tableau de bord',
                'Refonte du site web',
                '',
                'En cours',
                '2026-10-05',
                '2026-10-20',
            ], ';');

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Normalise une date reçue dans différents formats vers YYYY-MM-DD.
     * Retourne [date_normalisée, message_erreur] (l'un des deux est null).
     */
    private function normaliserDate(string $date): array
    {
        $date = trim($date);
        if ($date === '') {
            return [null, null];
        }

        // Format YYYY-MM-DD ou YYYY/MM/DD
        if (preg_match('/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/', $date, $m)) {
            $annee = (int) $m[1];
            $mois = (int) $m[2];
            $jour = (int) $m[3];
            if (checkdate($mois, $jour, $annee)) {
                return [sprintf('%04d-%02d-%02d', $annee, $mois, $jour), null];
            }
            return [null, 'date invalide'];
        }

        // Format DD/MM/YYYY ou DD-MM-YYYY
        if (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', $date, $m)) {
            $jour = (int) $m[1];
            $mois = (int) $m[2];
            $annee = (int) $m[3];
            if (checkdate($mois, $jour, $annee)) {
                return [sprintf('%04d-%02d-%02d', $annee, $mois, $jour), null];
            }
            return [null, 'date invalide'];
        }

        return [null, 'format invalide (attendu YYYY-MM-DD)'];
    }

    /**
     * Importe un lot de tâches depuis un fichier CSV.
     */
    public function import(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('Encadreur')) {
            throw ValidationException::withMessages([
                'task' => ['Seul un encadreur peut importer des tâches.'],
            ]);
        }

        $request->validate([
            'fichier' => 'required|file|max:5120',
        ]);

        $fichier = $request->file('fichier');
        $extension = strtolower($fichier->getClientOriginalExtension());

        if (! in_array($extension, ['csv', 'txt'], true)) {
            throw ValidationException::withMessages([
                'fichier' => ["Le fichier doit être au format CSV ou TXT. Extension reçue : .$extension"],
            ]);
        }

        $supervisorId = $user->supervisor?->id;
        if (! $supervisorId) {
            throw ValidationException::withMessages([
                'task' => ['Aucun profil encadreur associé à ce compte.'],
            ]);
        }

        $handle = fopen($fichier->getRealPath(), 'r');

        if (! $handle) {
            throw ValidationException::withMessages([
                'fichier' => ['Impossible d\'ouvrir le fichier.'],
            ]);
        }

        $projetsEncadreur = Project::whereHas('interns', fn ($q) => $q->where('supervisor_id', $supervisorId))
            ->with('interns.user')
            ->get();

        $header = fgetcsv($handle, 0, ';');
        if (! $header) {
            fclose($handle);
            throw ValidationException::withMessages([
                'fichier' => ['Le fichier est vide.'],
            ]);
        }

        if (isset($header[0])) {
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
            $header[0] = trim($header[0]);
        }

        $header = array_map('trim', $header);

        $colonnesRequises = ['nom_tache', 'projet', 'statut'];
        foreach ($colonnesRequises as $col) {
            if (! in_array($col, $header, true)) {
                fclose($handle);
                throw ValidationException::withMessages([
                    'fichier' => ["Colonne manquante dans le fichier : $col"],
                ]);
            }
        }

        $crees = 0;
        $erreurs = [];
        $ligne = 1;

        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            $ligne++;

            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $row = array_pad($row, count($header), '');
            $data = array_combine($header, array_slice($row, 0, count($header)));

            if ($data === false) {
                $erreurs[] = "Ligne $ligne : format invalide.";
                continue;
            }

            $nomTache = trim((string) ($data['nom_tache'] ?? ''));
            $projetNom = trim((string) ($data['projet'] ?? ''));
            $stagiaireEmail = trim((string) ($data['stagiaire_email'] ?? ''));
            $statut = trim((string) ($data['statut'] ?? 'À faire'));
            $dateDebutBrute = trim((string) ($data['date_debut'] ?? ''));
            $dateFinBrute = trim((string) ($data['date_fin'] ?? ''));

            if ($nomTache === '') {
                $erreurs[] = "Ligne $ligne : le nom de la tâche est obligatoire.";
                continue;
            }

            if ($projetNom === '') {
                $erreurs[] = "Ligne $ligne : le nom du projet est obligatoire.";
                continue;
            }

            // Résoudre le projet
            $projet = $projetsEncadreur->firstWhere('name', $projetNom);
            if (! $projet) {
                $erreurs[] = "Ligne $ligne : projet « $projetNom » introuvable ou non autorisé.";
                continue;
            }

            // Résoudre le stagiaire (optionnel)
            $internId = null;
            if ($stagiaireEmail !== '') {
                $intern = $projet->interns->first(function ($i) use ($stagiaireEmail) {
                    return $i->user && strcasecmp($i->user->email, $stagiaireEmail) === 0;
                });

                if (! $intern) {
                    $erreurs[] = "Ligne $ligne : stagiaire « $stagiaireEmail » non trouvé dans le projet « $projetNom ».";
                    continue;
                }
                $internId = $intern->id;
            }

            // Normaliser les dates (accepte YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY, DD-MM-YYYY)
            [$dateDebut, $errDebut] = $this->normaliserDate($dateDebutBrute);
            if ($errDebut) {
                $erreurs[] = "Ligne $ligne : date_debut $errDebut.";
                continue;
            }

            [$dateFin, $errFin] = $this->normaliserDate($dateFinBrute);
            if ($errFin) {
                $erreurs[] = "Ligne $ligne : date_fin $errFin.";
                continue;
            }

            if ($dateDebut && $dateFin && $dateFin < $dateDebut) {
                $erreurs[] = "Ligne $ligne : la date de fin doit être après la date de début.";
                continue;
            }

            // Créer la tâche
            Task::create([
                'name' => $nomTache,
                'project_id' => $projet->id,
                'intern_id' => $internId,
                'status' => $statut !== '' ? $statut : 'À faire',
                'start_date' => $dateDebut,
                'end_date' => $dateFin,
            ]);

            $crees++;
        }

        fclose($handle);

        return response()->json([
            'success' => true,
            'crees' => $crees,
            'erreurs' => $erreurs,
            'message' => $crees > 0
                ? "$crees tâche(s) créée(s) avec succès."
                : "Aucune tâche créée.",
        ]);
    }
}