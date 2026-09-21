<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $projects = Project::with(['tasks', 'interns.supervisor.user', 'interns.user']);

        if ($user->hasRole('Stagiaire')) {
            $intern = $user->intern;
            $internId = $intern?->id;
            $projects->whereHas('interns', fn ($q) => $q->where('interns.id', $internId));
        }

        if ($user->hasRole('Encadreur')) {
            $supervisorId = $user->supervisor?->id;
            if (! $supervisorId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $projects->whereHas('interns', fn ($q) => $q->where('interns.supervisor_id', $supervisorId));
        }

        return response()->json(['success' => true, 'data' => $projects->get()]);
    }

    public function show($id)
    {
        $project = Project::with(['tasks', 'interns.supervisor.user', 'interns.user'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $project]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'required|string|max:300',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|string|max:20',
            'intern_ids' => 'sometimes|array',
            'intern_ids.*' => 'exists:interns,id',
        ]);

        $project = Project::create($validated);

        if (! empty($validated['intern_ids'])) {
            $project->interns()->attach($validated['intern_ids']);
        }

        $project->load(['tasks', 'interns.supervisor.user', 'interns.user']);

        return response()->json(['success' => true, 'data' => $project], 201);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'description' => 'sometimes|string|max:300',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'status' => 'sometimes|string|max:20',
            'intern_ids' => 'sometimes|array',
            'intern_ids.*' => 'exists:interns,id',
        ]);

        $project->update($validated);

        if ($request->has('intern_ids')) {
            $project->interns()->sync($validated['intern_ids'] ?? []);
        }

        $project->load(['tasks', 'interns.supervisor.user', 'interns.user']);

        return response()->json(['success' => true, 'data' => $project]);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->interns()->detach();
        $project->delete();

        return response()->json(['success' => true, 'message' => 'Projet supprimé avec succès.']);
    }

    public function attachIntern(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'intern_ids' => 'required|array',
            'intern_ids.*' => 'exists:interns,id',
        ]);

        $project->interns()->syncWithoutDetaching($validated['intern_ids']);

        return response()->json(['success' => true, 'data' => $project->load(['tasks', 'interns.supervisor.user', 'interns.user'])]);
    }

    public function detachIntern($id, $internId)
    {
        $project = Project::findOrFail($id);
        Intern::findOrFail($internId);

        $project->interns()->detach($internId);

        return response()->json(['success' => true, 'data' => $project->load(['tasks', 'interns.supervisor.user', 'interns.user'])]);
    }
}