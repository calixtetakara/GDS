<?php

namespace Tests\Feature\Api;

use App\Models\Intern;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InternPermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Role::findOrCreate('Admin', 'web');
        $role->givePermissionTo(Permission::findOrCreate('view interns', 'web'));
        $this->user = User::factory()->create(['email' => 'admin.permission@example.com']);
        $this->user->assignRole('Admin');
    }

    public function test_admin_with_token_can_list_interns(): void
    {
        Intern::create([
            'date_of_birth' => '2000-01-01',
            'training' => 'Informatique',
            'institution' => 'Universite',
            'level' => 'Master',
            'supervisor_id' => null,
            'user_id' => null,
        ]);

        $token = $this->user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/interns')
            ->assertOk();
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $role = Role::findOrCreate('Stagiaire', 'web');
        $this->user->syncRoles(['Stagiaire']);

        $token = $this->user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/interns')
            ->assertStatus(403);
    }
}