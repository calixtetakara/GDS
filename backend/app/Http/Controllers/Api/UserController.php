<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AccountCreatedMail;
use App\Mail\ProfileUpdatedMail;
use App\Models\Intern;
use App\Models\Supervisor;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['intern', 'supervisor'])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->getRoleNames(),
                'intern' => $user->intern,
                'supervisor' => $user->supervisor,
            ];
        });

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function show($id)
    {
        $user = User::with(['intern', 'supervisor'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'intern' => $user->intern,
            'supervisor' => $user->supervisor,
        ]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|string|lowercase|email|max:50|unique:users,email',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|string|max:50',
            'role' => 'required|in:Admin,Encadreur,Stagiaire',
            'position' => 'required_if:role,Encadreur|nullable|string|max:50',
            'date_of_birth' => 'required_if:role,Stagiaire|nullable|date',
            'training' => 'required_if:role,Stagiaire|nullable|string|max:20',
            'institution' => 'required_if:role,Stagiaire|nullable|string|max:30',
            'level' => 'required_if:role,Stagiaire|nullable|string|max:30',
            'supervisor_id' => 'nullable|exists:supervisors,id',
        ]);

        $generatedPassword = $validated['password'] ?? Str::password(12);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $generatedPassword,
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'] ?? 'Active',
        ]);

        $user->assignRole($validated['role']);

        if ($validated['role'] === 'Encadreur') {
            Supervisor::updateOrCreate(
                ['user_id' => $user->id],
                ['position' => $validated['position']]
            );
        }

        if ($validated['role'] === 'Stagiaire') {
            Intern::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => $validated['date_of_birth'],
                    'training' => $validated['training'],
                    'institution' => $validated['institution'],
                    'level' => $validated['level'],
                    'supervisor_id' => $validated['supervisor_id'] ?? null,
                ]
            );
        }

        Notification::create([
            'user_id' => $user->id,
            'type' => 'account_created',
            'title' => 'Compte créé',
            'message' => "Votre compte a été créé par un administrateur. Un email avec vos identifiants a été envoyé à {$validated['email']}.",
        ]);

        try {
            Mail::to($user->email)->send(new AccountCreatedMail($user, $generatedPassword));
        } catch (\Throwable $e) {
            logger()->warning('Email de création de compte non envoyé', ['error' => $e->getMessage()]);
        }

        return response()->json(['success' => true, 'data' => $this->format($user), 'temporary_password' => $generatedPassword], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'email' => 'sometimes|string|lowercase|email|max:50|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|string|max:50',
            'role' => 'sometimes|in:Admin,Encadreur,Stagiaire',
            'position' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'training' => 'nullable|string|max:20',
            'institution' => 'nullable|string|max:30',
            'level' => 'nullable|string|max:30',
            'supervisor_id' => 'nullable|exists:supervisors,id',
        ]);

        $user->fill($request->only(['first_name', 'last_name', 'email', 'phone', 'status']));
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        $role = $validated['role'] ?? $user->getRoleNames()->first() ?? 'Admin';
        $user->syncRoles([$role]);

        if ($role === 'Encadreur' && $request->has('position')) {
            Supervisor::updateOrCreate(
                ['user_id' => $user->id],
                ['position' => $validated['position']]
            );
        }

        if ($role === 'Stagiaire' && $request->hasAny(['date_of_birth', 'training', 'institution', 'level', 'supervisor_id'])) {
            Intern::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => $validated['date_of_birth'] ?? $user->intern?->date_of_birth,
                    'training' => $validated['training'] ?? $user->intern?->training,
                    'institution' => $validated['institution'] ?? $user->intern?->institution,
                    'level' => $validated['level'] ?? $user->intern?->level,
                    'supervisor_id' => $request->has('supervisor_id') ? $validated['supervisor_id'] : $user->intern?->supervisor_id,
                ]
            );
        }

        $champsModifies = [];
        if ($request->has('first_name') && $validated['first_name'] !== $user->getOriginal('first_name')) $champsModifies[] = 'prénom';
        if ($request->has('last_name') && $validated['last_name'] !== $user->getOriginal('last_name')) $champsModifies[] = 'nom';
        if ($request->has('email') && $validated['email'] !== $user->getOriginal('email')) $champsModifies[] = 'email';
        if ($request->has('phone') && ($validated['phone'] ?? null) !== $user->getOriginal('phone')) $champsModifies[] = 'téléphone';
        if ($request->has('status') && ($validated['status'] ?? null) !== $user->getOriginal('status')) $champsModifies[] = 'statut';
        if (! empty($validated['password'])) $champsModifies[] = 'mot de passe';
        if ($request->has('role')) $champsModifies[] = 'rôle';

        if (count($champsModifies) > 0) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'profile_updated',
                'title' => 'Profil modifié',
                'message' => 'Votre profil a été modifié par un administrateur. Champs modifiés : ' . implode(', ', $champsModifies) . '.',
            ]);

            try {
                Mail::to($user->email)->send(new ProfileUpdatedMail($user, $champsModifies));
            } catch (\Throwable $e) {
                logger()->warning('Email de modification de profil non envoyé', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['success' => true, 'data' => $this->format($user)]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé avec succès.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'email' => 'sometimes|string|lowercase|email|max:50|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        $user->fill($request->only(['first_name', 'last_name', 'email', 'phone']));

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        $user->load(['intern', 'supervisor']);

        return response()->json(['success' => true, 'data' => $this->format($user)]);
    }

    private function format(User $user)
    {
        $user->load(['intern', 'supervisor']);

        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'intern' => $user->intern,
            'supervisor' => $user->supervisor,
        ];
    }
}