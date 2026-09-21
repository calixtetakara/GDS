<?php

namespace Database\Seeders;

use App\Models\Supervisor;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            'admin@example.com' => [
                'last_name' => 'Admin',
                'first_name' => 'Administrateur',
                'role' => 'Admin',
            ],
            'admin@stagio.com' => [
                'last_name' => 'Admin',
                'first_name' => 'Superviseur Global',
                'role' => 'Admin',
            ],
            'encadreur@stagio.com' => [
                'last_name' => 'Encadreur',
                'first_name' => 'Encadrant Test',
                'role' => 'Encadreur',
            ],
            'stagiaire@stagio.com' => [
                'last_name' => 'Stagiaire',
                'first_name' => 'Stagiaire Test',
                'role' => 'Stagiaire',
            ],
        ];

        foreach ($accounts as $email => $data) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'last_name' => $data['last_name'],
                    'first_name' => $data['first_name'],
                    'password' => 'password',
                    'phone' => null,
                    'status' => 'Active',
                ]
            );

            $user->syncRoles([$data['role']]);

            if ($data['role'] === 'Encadreur') {
                Supervisor::updateOrCreate(
                    ['user_id' => $user->id],
                    ['position' => 'Encadreur principal']
                );
            }
        }
    }
}