<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'name',
    'description',
    'start_date',
    'end_date',
    'status',
])]
class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
    public function interns(): BelongsToMany
    {
        return $this->belongsToMany(Intern::class, 'project_intern');
    }
    public function assignedInterns()
    {
        return $this->belongsToMany(Intern::class, 'project_intern')->withTimestamps();
    }
}