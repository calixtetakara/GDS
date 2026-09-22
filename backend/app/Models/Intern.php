<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'date_of_birth',
    'training',
    'institution',
    'level',
    'type_stage',     // <-- type de stage
    'start_date',     // <-- début de stage
    'end_date',       // <-- fin de stage
    'supervisor_id',
    'user_id',
])]
class Intern extends Model
{
    /** @use HasFactory<\Database\Factories\InternFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'start_date' => 'date',   // <-- ajout
            'end_date' => 'date',     // <-- ajout
        ];
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_intern');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}