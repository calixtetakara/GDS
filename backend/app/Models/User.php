<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'last_name',
    'first_name',
    'email',
    'password',
    'phone',
    'status',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function supervisor(): HasOne
    {
        return $this->hasOne(Supervisor::class);
    }

    public function intern(): HasOne
    {
        return $this->hasOne(Intern::class);
    }

    /**
     * Envoie l'email de réinitialisation de mot de passe.
     */
    public function sendPasswordResetNotification($token)
    {
        $url = config('app.frontend_url')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($this->email);

        Mail::send('emails.reset-password', [
            'url' => $url,
            'user' => $this,
        ], function ($message) {
            $message->to($this->email)
                ->subject('Réinitialisation de ton mot de passe Stagio');
        });
    }
}