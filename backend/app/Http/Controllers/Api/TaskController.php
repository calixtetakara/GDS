<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = Task::with(['project.interns.supervisor.user', 'project.interns.user', 'intern.user']);

        if ($user->hasRole('Stagiaire')) {
            $internId = $user->intern?->id;
            $tasks->whereHas('project.interns', fn ($q) => $q->where('interns.id', $internId));
        }

        if ($user->hasRole('Encadreur')) {
            $supervisorId = $user->supervisor?->id;
            if (! $supervisorId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $tasks->whereHas('project.interns', fn ($q) => $q->where('interns.supervisor_id', $supervisorId));
        }

        return response()->json(['success' => true, 'data' => $tasks->get()]);
    }

    public function show($id)
    {
        $task = Task::with(['project.interns.supervisor.user', 'project.interns.user', 'intern.user'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:30',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|string|max:50',
            'project_id' => 'required|exists:projects,id',
            'intern_id' => 'nullable|exists:interns,id',
        ]);

        $task = Task::create($validated);
        $task->load(['project.interns.supervisor.user', 'project.interns.user', 'intern.user']);

        return response()->json(['success' => true, 'data' => $task], 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:30',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'status' => 'sometimes|string|max:50',
            'project_id' => 'sometimes|exists:projects,id',
            'intern_id' => 'nullable|exists:interns,id',
        ]);

        $task->update($validated);
        $task->load(['project.interns.supervisor.user', 'project.interns.user', 'intern.user']);

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['success' => true, 'message' => 'Tâche supprimée avec succès.']);
    }
}
