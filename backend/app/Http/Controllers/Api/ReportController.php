<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $reports = Report::with(['intern.user', 'supervisor.user']);

        if ($user->hasRole('Encadreur')) {
            $supervisorId = $user->supervisor?->id;
            if (! $supervisorId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $reports->where('supervisor_id', $supervisorId);
        }

        if ($user->hasRole('Stagiaire')) {
            $reports->where('intern_id', $user->intern?->id);
        }

        return response()->json(['success' => true, 'data' => $reports->get()]);
    }

    public function show(Request $request, $id)
    {
        $report = Report::with(['intern.user', 'supervisor.user'])->findOrFail($id);

        $this->ensureCanView($request->user(), $report);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $intern = $user->intern;

        if (! $intern) {
            throw ValidationException::withMessages([
                'intern' => ['Aucun profil stagiaire associé à ce compte.'],
            ]);
        }

        $validated = $request->validate([
            'week' => 'required|string|max:20',
            'submission_date' => 'required|date',
            'content' => 'required|string',
            'document' => 'nullable|file|mimes:pdf|max:10240',
            'comment' => 'nullable|string|max:100',
        ]);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('reports', 'public');
        }

        $report = Report::create([
            'week' => $validated['week'],
            'submission_date' => $validated['submission_date'],
            'content' => $validated['content'],
            'file' => $documentPath,
            'comment' => $validated['comment'] ?? null,
            'status' => 'En attente',
            'supervisor_id' => $intern->supervisor_id,
            'intern_id' => $intern->id,
        ]);
        $report->load(['intern.user', 'supervisor.user']);

        return response()->json(['success' => true, 'data' => $report], 201);
    }

    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        if (! $user->hasRole('Stagiaire') || $report->intern_id !== $user->intern?->id) {
            throw ValidationException::withMessages([
                'report' => ['Vous ne pouvez modifier que vos propres rapports.'],
            ]);
        }

        if ($report->status !== 'En attente') {
            throw ValidationException::withMessages([
                'report' => ['Un rapport déjà validé ou rejeté ne peut plus être modifié.'],
            ]);
        }

        $validated = $request->validate([
            'week' => 'sometimes|string|max:20',
            'submission_date' => 'sometimes|date',
            'content' => 'sometimes|string',
            'document' => 'nullable|file|mimes:pdf|max:10240',
            'comment' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('document')) {
            if ($report->file && Storage::disk('public')->exists($report->file)) {
                Storage::disk('public')->delete($report->file);
            }
            $validated['file'] = $request->file('document')->store('reports', 'public');
        }

        unset($validated['document']);
        $report->update($validated);
        $report->load(['intern.user', 'supervisor.user']);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function updateStatus(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        if ($user->hasRole('Encadreur') && $report->supervisor_id !== $user->supervisor?->id) {
            throw ValidationException::withMessages([
                'report' => ['Vous ne pouvez valider que les rapports de vos stagiaires.'],
            ]);
        }

        $validated = $request->validate([
            'status' => 'required|in:En attente,Valide,Rejete',
            'comment' => 'nullable|string|max:100',
        ]);

        $report->update([
            'status' => $validated['status'],
            'comment' => $request->has('comment') ? $validated['comment'] : $report->comment,
        ]);
        $report->load(['intern.user', 'supervisor.user']);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function destroy(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $this->ensureCanView($request->user(), $report);

        $report->delete();

        return response()->json(['success' => true, 'message' => 'Rapport supprimé avec succès.']);
    }

    public function exportPdf(Request $request, $id)
    {
        $report = Report::with(['intern.user', 'supervisor.user'])->findOrFail($id);
        $this->ensureCanView($request->user(), $report);

        $pdf = Pdf::loadView('rapports.pdf_single', ['report' => $report]);

        $filename = 'rapport-'.$report->week.'.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    public function exportAllPdf(Request $request)
    {
        $user = $request->user();
        $intern = $user->intern;

        if (! $intern) {
            throw ValidationException::withMessages([
                'intern' => ['Aucun profil stagiaire associé à ce compte.'],
            ]);
        }

        $reports = Report::with(['intern.user', 'supervisor.user'])
            ->where('intern_id', $intern->id)
            ->get();

        $pdf = Pdf::loadView('rapports.pdf_all', [
            'reports' => $reports,
            'intern' => $intern,
        ]);

        $prenom = $intern->user->first_name;
        $nom = $intern->user->last_name;
        $filename = 'rapports-'.$prenom.'-'.$nom.'.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    public function downloadDocument(Request $request, $id)
    {
        $report = Report::with(['intern.user', 'supervisor.user'])->findOrFail($id);
        $this->ensureCanView($request->user(), $report);

        if (! $report->file || ! Storage::disk('public')->exists($report->file)) {
            throw ValidationException::withMessages([
                'document' => ['Aucun document joint à ce rapport.'],
            ]);
        }

        $path = $report->file;
        $filename = basename($path);

        return response(Storage::disk('public')->get($path), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    public function exportInternPdf(Request $request, $internId)
    {
        $user = $request->user();
        $intern = Intern::with(['user', 'supervisor.user', 'projects', 'reports.supervisor.user'])->findOrFail($internId);

        if ($user->hasRole('Encadreur') && $intern->supervisor_id !== $user->supervisor?->id) {
            throw ValidationException::withMessages([
                'intern' => ['Vous ne pouvez exporter que le suivi de vos propres stagiaires.'],
            ]);
        }

        $reports = $intern->reports()->with(['supervisor.user'])->orderBy('submission_date')->get();
        $projects = $intern->projects;
        $tasks = \App\Models\Task::whereIn('project_id', $projects->pluck('id'))->with('project')->get();

        $pdf = Pdf::loadView('rapports.pdf_tracking', [
            'intern' => $intern,
            'reports' => $reports,
            'projects' => $projects,
            'tasks' => $tasks,
        ]);

        $prenom = $intern->user->first_name;
        $nom = $intern->user->last_name;
        $filename = 'suivi-'.$prenom.'-'.$nom.'.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }

    private function ensureCanView($user, Report $report): void
    {
        if ($user->hasRole('Encadreur') && $report->supervisor_id !== $user->supervisor?->id) {
            throw ValidationException::withMessages([
                'report' => ['Vous ne pouvez pas consulter ce rapport.'],
            ]);
        }

        if ($user->hasRole('Stagiaire') && $report->intern_id !== $user->intern?->id) {
            throw ValidationException::withMessages([
                'report' => ['Vous ne pouvez pas consulter ce rapport.'],
            ]);
        }
    }
}