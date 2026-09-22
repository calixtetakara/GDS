<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AccountCreatedMail;
use App\Models\Intern;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InternController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $interns = Intern::with(['supervisor.user', 'user', 'projects']);

        if ($user->hasRole('Encadreur')) {
            $supervisorId = $user->supervisor?->id;
            if (! $supervisorId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $interns->where('supervisor_id', $supervisorId);
        }

        if ($user->hasRole('Stagiaire')) {
            $interns->where('user_id', $user->id);
        }

        return response()->json(['success' => true, 'data' => $interns->get()]);
    }

    public function show(Request $request, $id)
    {
        $intern = Intern::with(['supervisor.user', 'user', 'projects'])->findOrFail($id);

        $this->ensureCanView($request->user(), $intern);

        return response()->json(['success' => true, 'data' => $intern]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_of_birth' => 'nullable|date',
            'training' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'level' => 'required|string|max:255',
            'type_stage' => 'nullable|in:hybride,online,onsite',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'supervisor_id' => 'nullable|exists:supervisors,id',
            'user_id' => 'nullable|exists:users,id',
            'first_name' => 'nullable|string|max:50',
            'last_name' => 'nullable|string|max:50',
            'email' => 'nullable|string|lowercase|email|max:50|unique:users,email',
            'password' => 'nullable|string|min:8',
        ]);

        $user = null;
        $generatedPassword = null;

        try {
            $intern = DB::transaction(function () use ($validated, &$user, &$generatedPassword) {
                if (! empty($validated['email'])) {
                    $generatedPassword = $validated['password'] ?? Str::password(12);
                    $user = User::create([
                        'first_name' => $validated['first_name'] ?? 'Stagiaire',
                        'last_name' => $validated['last_name'] ?? 'Inconnu',
                        'email' => $validated['email'],
                        'password' => $generatedPassword,
                        'status' => 'Active',
                    ]);
                    $user->assignRole('Stagiaire');

                    try {
                        Mail::to($user->email)->send(new AccountCreatedMail($user, $generatedPassword));
                    } catch (\Throwable $e) {
                        logger()->warning('Email non envoyé', ['error' => $e->getMessage()]);
                    }
                }

                return Intern::create([
                    'date_of_birth' => $validated['date_of_birth'] ?? null,
                    'training' => $validated['training'],
                    'institution' => $validated['institution'],
                    'level' => $validated['level'],
                    'type_stage' => $validated['type_stage'] ?? null,
                    'start_date' => $validated['start_date'] ?? null,
                    'end_date' => $validated['end_date'] ?? null,
                    'supervisor_id' => $validated['supervisor_id'] ?? null,
                    'user_id' => $user?->id ?? $validated['user_id'] ?? null,
                ]);
            });
        } catch (\Throwable $e) {
            logger()->error('Erreur création stagiaire', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création : ' . $e->getMessage(),
            ], 500);
        }

        $intern->load(['supervisor.user', 'user', 'projects']);

        return response()->json([
            'success' => true,
            'data' => $intern,
            'temporary_password' => $generatedPassword,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $intern = Intern::findOrFail($id);

        $validated = $request->validate([
            'date_of_birth' => 'sometimes|nullable|date',
            'training' => 'sometimes|string|max:255',
            'institution' => 'sometimes|string|max:255',
            'level' => 'sometimes|string|max:255',
            'type_stage' => 'sometimes|nullable|in:hybride,online,onsite',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'supervisor_id' => 'nullable|exists:supervisors,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        try {
            $intern->update($validated);
        } catch (\Throwable $e) {
            logger()->error('Erreur mise à jour stagiaire', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage(),
            ], 500);
        }

        $intern->load(['supervisor.user', 'user', 'projects']);

        return response()->json(['success' => true, 'data' => $intern]);
    }

    public function destroy($id)
    {
        $intern = Intern::findOrFail($id);
        $user = $intern->user;
        $intern->delete();
        $user?->delete();

        return response()->json(['success' => true, 'message' => 'Stagiaire supprimé avec succès.']);
    }

    public function assignSupervisor(Request $request, $id)
    {
        $intern = Intern::findOrFail($id);

        $validated = $request->validate([
            'supervisor_id' => 'nullable|exists:supervisors,id',
        ]);

        $intern->update(['supervisor_id' => $validated['supervisor_id'] ?? null]);
        $intern->load(['supervisor.user', 'user', 'projects']);

        return response()->json(['success' => true, 'data' => $intern, 'message' => 'Affectation mise à jour.']);
    }

    private function ensureCanView($user, Intern $intern): void
    {
        if ($user->hasRole('Encadreur') && $intern->supervisor_id !== $user->supervisor?->id) {
            throw ValidationException::withMessages([
                'intern' => ['Vous ne pouvez pas consulter ce stagiaire.'],
            ]);
        }

        if ($user->hasRole('Stagiaire') && $intern->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'intern' => ['Vous ne pouvez pas consulter ce stagiaire.'],
            ]);
        }
    }
}