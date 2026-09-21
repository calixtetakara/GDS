<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'start_date',
    'end_date',
    'status',
    'project_id',
    'intern_id',
])]
class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    public function intern(): BelongsTo
    {
        return $this->belongsTo(Intern::class);
    }
}