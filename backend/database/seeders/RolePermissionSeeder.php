<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
    // Utilisateurs
    'view users',
    'create users',
    'edit users',
    'delete users',

    // Stagiaires
    'view interns',
    'create interns',
    'edit interns',
    'delete interns',

    // Encadreurs
    'view supervisors',
    'create supervisors',
    'edit supervisors',
    'delete supervisors',

    // Projets
    'view projects',
    'create projects',
    'edit projects',
    'delete projects',

    // Tâches
    'view tasks',
    'create tasks',
    'edit tasks',
    'delete tasks',

    // Rapports
    'view reports',
    'submit reports',
    'validate reports',
   ];

    foreach ($permissions as $permission) {
    Permission::create([
        'name' => $permission,
    ]);
    }
    }
}
