<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Users
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Interns
            'view interns',
            'create interns',
            'edit interns',
            'delete interns',

            // Supervisors
            'view supervisors',
            'create supervisors',
            'edit supervisors',
            'delete supervisors',

            // Projects
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',

            // Tasks
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',

            // Reports
            'view reports',
            'create reports',
            'edit reports',
            'delete reports',
            'validate reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
            ]);
        }
    }
}