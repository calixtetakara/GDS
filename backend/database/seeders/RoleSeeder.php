<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Création des rôles
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $encadreur = Role::firstOrCreate(['name' => 'Encadreur']);
        $stagiaire = Role::firstOrCreate(['name' => 'Stagiaire']);

        // Permissions de l'Administrateur
        $admin->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'delete users',

            'view interns',
            'create interns',
            'edit interns',
            'delete interns',

            'view supervisors',
            'create supervisors',
            'edit supervisors',
            'delete supervisors',

            'view projects',
            'create projects',
            'edit projects',
            'delete projects',

            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',

            'view reports',
            'create reports',
            'edit reports',
            'delete reports',
            'validate reports',
        ]);
        // Permissions de l'Encadreur
        $encadreur->givePermissionTo([
            'view interns',

            'view supervisors',

            'view projects',

            'view tasks',

            'view reports',
            'validate reports',
]);
        // Permissions du Stagiaire
        $stagiaire->givePermissionTo([
            'view interns',
            'view projects',
            'view tasks',
            'create reports',
            'view reports',
            'edit reports',
]);
    }
}