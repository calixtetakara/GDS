<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'week',
    'submission_date',
    'content',
    'file',
    'status',
    'comment',
    'supervisor_id',
    'intern_id',
])]
class Report extends Model
{
    /** @use HasFactory<\Database\Factories\ReportFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'submission_date' => 'date',
        ];
    }
    public function intern(): BelongsTo
    {
        return $this->belongsTo(Intern::class);
    }
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }
}