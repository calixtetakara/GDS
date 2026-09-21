<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Fillable([
    'position',
    'user_id',
])]
class Supervisor extends Model
{
    /** @use HasFactory<\Database\Factories\SupervisorFactory> */
    use HasFactory;
    public function interns(): HasMany
    {
       return $this->hasMany(Intern::class);
    }
    public function user(): BelongsTo
    {
       return $this->belongsTo(User::class);
    }
    public function reports(): HasMany
    {
       return $this->hasMany(Report::class);
    }
}


