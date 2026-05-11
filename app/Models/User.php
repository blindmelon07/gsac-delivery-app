<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'avatar', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Order::class, 'rider_id');
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=E8622A&color=fff';
    }

    public function getTotalSpentAttribute(): float
    {
        return $this->orders()->where('status', 'delivered')->sum('total_amount');
    }

    public function isAdmin(): bool { return $this->hasRole('admin'); }
    public function isRider(): bool { return $this->hasRole('rider'); }
    public function isCustomer(): bool { return $this->hasRole('customer'); }

    public function getDashboardRoute(): string
    {
        return match (true) {
            $this->isAdmin() => 'admin.dashboard',
            $this->isRider() => 'rider.dashboard',
            default => 'customer.dashboard',
        };
    }
}
