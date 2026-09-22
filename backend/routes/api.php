<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InternController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SupervisorController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API (accessibles via le préfixe /api)
|--------------------------------------------------------------------------
*/

// === Routes publiques ===
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/ping', function () {
    return response()->json(['message' => 'API fonctionnelle']);
});

// === Routes protégées (authentification Sanctum obligatoire) ===
Route::middleware('auth:sanctum')->group(function () {

    // --- Authentification ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [UserController::class, 'updateProfile']);

    // --- Stagiaires ---
    Route::get('/interns', [InternController::class, 'index'])->middleware('permission:view interns');
    Route::get('/interns/{id}', [InternController::class, 'show'])->middleware('permission:view interns');
    Route::post('/interns', [InternController::class, 'store'])->middleware('permission:create interns');
    Route::put('/interns/{id}', [InternController::class, 'update'])->middleware('permission:edit interns');
    Route::delete('/interns/{id}', [InternController::class, 'destroy'])->middleware('permission:delete interns');
    Route::put('/interns/{id}/supervisor', [InternController::class, 'assignSupervisor'])->middleware('permission:edit interns');

    // --- Encadreurs ---
    Route::get('/supervisors', [SupervisorController::class, 'index'])->middleware('permission:view supervisors');
    Route::get('/supervisors/{id}', [SupervisorController::class, 'show'])->middleware('permission:view supervisors');
    Route::post('/supervisors', [SupervisorController::class, 'store'])->middleware('permission:create supervisors');
    Route::put('/supervisors/{id}', [SupervisorController::class, 'update'])->middleware('permission:edit supervisors');
    Route::delete('/supervisors/{id}', [SupervisorController::class, 'destroy'])->middleware('permission:delete supervisors');

    // --- Projets ---
    Route::get('/projects', [ProjectController::class, 'index'])->middleware('permission:view projects');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->middleware('permission:view projects');
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('permission:create projects');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->middleware('permission:edit projects');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->middleware('permission:delete projects');
    Route::post('/projects/{id}/interns', [ProjectController::class, 'attachIntern'])->middleware('permission:edit projects');
    Route::delete('/projects/{id}/interns/{internId}', [ProjectController::class, 'detachIntern'])->middleware('permission:edit projects');

    // --- Tâches ---
    Route::get('/tasks', [TaskController::class, 'index'])->middleware('permission:view tasks');
    Route::get('/tasks/{id}', [TaskController::class, 'show'])->middleware('permission:view tasks');
    Route::post('/tasks', [TaskController::class, 'store'])->middleware('permission:create tasks');
    Route::put('/tasks/{id}', [TaskController::class, 'update'])->middleware('permission:edit tasks');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->middleware('permission:delete tasks');

    // --- Rapports ---
    Route::get('/reports', [ReportController::class, 'index'])->middleware('permission:view reports');
    Route::get('/reports/{id}', [ReportController::class, 'show'])->middleware('permission:view reports');
    Route::post('/reports', [ReportController::class, 'store'])->middleware('permission:create reports');
    Route::put('/reports/{id}', [ReportController::class, 'update'])->middleware('permission:edit reports');
    Route::patch('/reports/{id}/status', [ReportController::class, 'updateStatus'])->middleware('permission:validate reports');
    Route::delete('/reports/{id}', [ReportController::class, 'destroy'])->middleware('permission:delete reports');
    Route::get('/reports/{id}/pdf', [ReportController::class, 'exportPdf'])->middleware('permission:view reports');
    Route::get('/reports/intern/{internId}/pdf', [ReportController::class, 'exportInternPdf'])->middleware('permission:view reports');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportAllPdf'])->middleware('permission:view reports');
    Route::get('/reports/{id}/document', [ReportController::class, 'downloadDocument'])->middleware('permission:view reports');

    // --- Utilisateurs (Admin) ---
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view users');
    Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:view users');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create users');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:edit users');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:delete users');

    // --- Notifications ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});