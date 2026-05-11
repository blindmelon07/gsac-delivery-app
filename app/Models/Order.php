<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    const PAYMENT_UNPAID = 'unpaid';
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_FAILED = 'failed';

    protected $fillable = [
        'customer_id', 'rider_id', 'status', 'total_amount', 'delivery_fee',
        'delivery_address', 'notes', 'estimated_delivery_at', 'delivered_at',
        'paymongo_payment_intent_id', 'paymongo_payment_id', 'payment_status',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'estimated_delivery_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function scopeForCustomer($query, int $userId)
    {
        return $query->where('customer_id', $userId);
    }

    public function scopeForRider($query, int $userId)
    {
        return $query->where('rider_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_CONFIRMED, self::STATUS_PREPARING, self::STATUS_OUT_FOR_DELIVERY]);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED)->whereNull('rider_id');
    }
}
