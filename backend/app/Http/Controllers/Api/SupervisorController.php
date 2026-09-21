<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AccountCreatedMail;
use App\Models\Supervisor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SupervisorController extends Controller
{
    public function index(Request $request)
    {
        $supervisors = Supervisor::with(['user', 'interns'])->get();

        return response()->json(['success' => true, 'data' => $supervisors]);
    }

    public function show($id)
    {
        $supervisor = Supervisor::with(['user', 'interns'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $supervisor]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|string|lowercase|email|max:50|unique:users,email',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|max:50',
        ]);

        $generatedPassword = $validated['password'] ?? Str::password(12);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $generatedPassword,
            'phone' => $validated['phone'] ?? null,
            'status' => 'Active',
        ]);
        $user->assignRole('Encadreur');

        try {
            Mail::to($user->email)->send(new AccountCreatedMail($user, $generatedPassword));
        } catch (\Throwable $e) {
            logger()->warning('Email de création de compte encadreur non envoyé', ['error' => $e->getMessage()]);
        }

        $supervisor = Supervisor::create([
            'position' => $validated['position'],
            'user_id' => $user->id,
        ]);
        $supervisor->load(['user', 'interns']);

        return response()->json(['success' => true, 'data' => $supervisor, 'temporary_password' => $generatedPassword], 201);
    }

    public function update(Request $request, $id)
    {
        $supervisor = Supervisor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'email' => 'sometimes|string|lowercase|email|max:50|unique:users,email,'.$supervisor->user_id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|string|max:50',
            'position' => 'sometimes|string|max:50',
        ]);

        if ($request->hasAny(['first_name', 'last_name', 'email', 'password', 'phone', 'status'])) {
            $supervisor->user->fill($request->only(['first_name', 'last_name', 'email', 'phone', 'status']));
            if (! empty($validated['password'])) {
                $supervisor->user->password = Hash::make($validated['password']);
            }
            $supervisor->user->save();
        }

        if ($request->has('position')) {
            $supervisor->position = $validated['position'];
        }
        $supervisor->save();
        $supervisor->load(['user', 'interns']);

        return response()->json(['success' => true, 'data' => $supervisor]);
    }

    public function destroy($id)
    {
        $supervisor = Supervisor::findOrFail($id);

        if ($supervisor->interns()->exists()) {
            throw ValidationException::withMessages([
                'supervisor' => ['Impossible de supprimer un encadreur qui a des stagiaires affectés.'],
            ]);
        }

        $user = $supervisor->user;
        $supervisor->delete();
        $user?->delete();

        return response()->json(['success' => true, 'message' => 'Encadreur supprimé avec succès.']);
    }
}