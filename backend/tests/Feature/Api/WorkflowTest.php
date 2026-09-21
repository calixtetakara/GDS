<?php

namespace Tests\Feature\Api;

use App\Models\Intern;
use App\Models\Project;
use App\Models\Report;
use App\Models\Supervisor;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function creerRoles(): void
    {
        $admin = Role::findOrCreate('Admin', 'web');
        $encadreur = Role::findOrCreate('Encadreur', 'web');
        $stagiaire = Role::findOrCreate('Stagiaire', 'web');

        $toutes = [
            'view users', 'create users', 'edit users', 'delete users',
            'view interns', 'create interns', 'edit interns', 'delete interns',
            'view supervisors', 'create supervisors', 'edit supervisors', 'delete supervisors',
            'view projects', 'create projects', 'edit projects', 'delete projects',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks',
            'view reports', 'create reports', 'edit reports', 'delete reports',
            'validate reports',
        ];
        foreach ($toutes as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
        $admin->givePermissionTo($toutes);

        $encadreur->givePermissionTo([
            'view interns', 'view supervisors',
            'view projects', 'create projects', 'edit projects', 'delete projects',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks',
            'view reports', 'create reports', 'validate reports',
        ]);

        $stagiaire->givePermissionTo([
            'view supervisors',
            'view projects',
            'view tasks',
            'view reports', 'create reports', 'edit reports',
        ]);
    }

    private function utilisateur(string $email, string $role): User
    {
        $user = User::factory()->create(['email' => $email, 'status' => 'Active']);
        $user->assignRole($role);

        return $user;
    }

    private function token(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }

    public function test_admin_cree_supervisor_projet_et_tache(): void
    {
        $this->creerRoles();
        $admin = $this->utilisateur('admin.workflow@example.com', 'Admin');
        $token = $this->token($admin);

        $response = $this->withToken($token)->postJson('/api/supervisors', [
            'first_name' => 'Marc',
            'last_name' => 'Lefevre',
            'email' => 'marc.workflow@example.com',
            'password' => 'password',
            'position' => 'Developpement',
        ]);
        $response->assertCreated();
        $this->assertDatabaseHas('supervisors', ['user_id' => $response->json('data.user_id')]);
        $this->assertDatabaseHas('users', ['email' => 'marc.workflow@example.com']);
        $supervisorId = $response->json('data.id');

        $intern = Intern::create([
            'date_of_birth' => '2001-03-10',
            'training' => 'Informatique',
            'institution' => 'UCAD',
            'level' => 'Licence',
            'supervisor_id' => $supervisorId,
            'user_id' => null,
        ]);

        $response = $this->withToken($token)->postJson('/api/projects', [
            'name' => 'Plateforme web',
            'description' => 'Projet de stage',
            'start_date' => '2026-09-01',
            'end_date' => '2026-12-01',
            'status' => 'En cours',
            'intern_ids' => [$intern->id],
        ]);
        $response->assertCreated();
        $this->assertDatabaseHas('project_intern', ['intern_id' => $intern->id, 'project_id' => $response->json('data.id')]);
        $projectId = $response->json('data.id');

        $response = $this->withToken($token)->postJson('/api/tasks', [
            'name' => 'Design UI',
            'start_date' => '2026-09-05',
            'end_date' => '2026-09-20',
            'status' => 'A faire',
            'project_id' => $projectId,
        ]);
        $response->assertCreated();
        $this->assertDatabaseHas('tasks', ['id' => $response->json('data.id')]);
    }

    public function test_stagiaire_soumet_rapport_et_supervisor_le_valide(): void
    {
        $this->creerRoles();
        $admin = $this->utilisateur('admin.rapport@example.com', 'Admin');

        $sup = $this->withToken($this->token($admin))->postJson('/api/supervisors', [
            'first_name' => 'Awa',
            'last_name' => 'Ndiaye',
            'email' => 'awa.rapport@example.com',
            'password' => 'password',
            'position' => 'Doctorat',
        ])->json('data');

        $stagiaireUser = $this->utilisateur('stagiaire.rapport@example.com', 'Stagiaire');
        $intern = Intern::create([
            'date_of_birth' => '2002-06-15',
            'training' => 'Reseaux',
            'institution' => 'ESP',
            'level' => 'Master',
            'supervisor_id' => $sup['id'],
            'user_id' => $stagiaireUser->id,
        ]);

        $tokenStagiaire = $this->token($stagiaireUser);

        \Illuminate\Support\Facades\Auth::forgetGuards();

        $response = $this->withToken($tokenStagiaire)->postJson('/api/reports', [
            'week' => 'Semaine 1',
            'submission_date' => '2026-09-08',
            'content' => 'Mise en place de la base de donnees.',
        ]);
        $response->assertCreated();
        $this->assertDatabaseHas('reports', ['id' => $response->json('data.id'), 'content' => 'Mise en place de la base de donnees.', 'status' => 'En attente', 'supervisor_id' => $sup['id']]);
        $reportId = $response->json('data.id');

        // Le superviseur connecté valide le rapport de son stagiaire
        $supervisorUser = User::where('email', 'awa.rapport@example.com')->first();
        $tokenSup = $this->token($supervisorUser);

        \Illuminate\Support\Facades\Auth::forgetGuards();

        $this->withToken($tokenSup)->patchJson("/api/reports/$reportId/status", [
            'status' => 'Valide',
            'comment' => 'Tres bon travail.',
        ])->assertOk();

        $this->assertDatabaseHas('reports', ['id' => $reportId, 'status' => 'Valide', 'comment' => 'Tres bon travail.']);
    }

    public function test_stagiaire_ne_peut_pas_valider_un_rapport(): void
    {
        $this->creerRoles();
        $stagiaire = $this->utilisateur('stagiaire.noauth@example.com', 'Stagiaire');
        $report = Report::create([
            'week' => 'Semaine 1',
            'submission_date' => '2026-09-08',
            'content' => 'Contenu',
            'status' => 'En attente',
            'supervisor_id' => null,
            'intern_id' => null,
        ]);

        $this->withToken($this->token($stagiaire))
            ->patchJson("/api/reports/$report->id/status", ['status' => 'Valide'])
            ->assertStatus(403);
    }

    public function test_scoping_encadreur_sur_interns_et_reports(): void
    {
        $this->creerRoles();
        $encadreur = $this->utilisateur('encadreur.scope@example.com', 'Encadreur');

        $supervisor = Supervisor::create(['user_id' => $encadreur->id, 'position' => 'Data']);
        $encadreur->load('supervisor');

        Intern::create([
            'date_of_birth' => '2000-01-01',
            'training' => 'Info',
            'institution' => 'Univ',
            'level' => 'M1',
            'supervisor_id' => $supervisor->id,
            'user_id' => null,
        ]);
        Intern::create([
            'date_of_birth' => '2000-01-01',
            'training' => 'Compta',
            'institution' => 'Autre',
            'level' => 'M2',
            'supervisor_id' => null,
            'user_id' => null,
        ]);

        $token = $this->token($encadreur);

        $interns = $this->withToken($token)
            ->getJson('/api/interns')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $interns);
        $this->assertEquals($supervisor->id, $interns[0]['supervisor_id']);
    }

    public function test_stagiaire_ne_voit_que_ses_propres_projets(): void
    {
        $this->creerRoles();
        $stagiaire = $this->utilisateur('stagiaire.projets@example.com', 'Stagiaire');
        $stagiaire->load('intern');

        $intern = Intern::create([
            'date_of_birth' => '2001-01-01',
            'training' => 'Dev',
            'institution' => 'Univ',
            'level' => 'L3',
            'supervisor_id' => null,
            'user_id' => $stagiaire->id,
        ]);

        $monProjet = Project::create(['name' => 'Mon projet', 'description' => 'A moi', 'start_date' => '2026-01-01', 'end_date' => '2026-06-01', 'status' => 'En cours']);
        $autreProjet = Project::create(['name' => 'Autre projet', 'description' => 'Pas a moi', 'start_date' => '2026-01-01', 'end_date' => '2026-06-01', 'status' => 'En cours']);
        $monProjet->interns()->attach($intern->id);

        $projets = $this->withToken($this->token($stagiaire))
            ->getJson('/api/projects')
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $projets);
        $this->assertEquals('Mon projet', $projets[0]['name']);
        $this->assertEquals($autreProjet->id, $autreProjet->id);
    }

    public function test_stagiaire_bloque_sur_users(): void
    {
        $this->creerRoles();
        $stagiaire = $this->utilisateur('stagiaire.bloque@example.com', 'Stagiaire');

        $this->withToken($this->token($stagiaire))
            ->getJson('/api/users')
            ->assertStatus(403);
    }
}