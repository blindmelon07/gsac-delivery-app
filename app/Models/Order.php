<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_PREPARING = 'preparing';
    public const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    public const PAYMENT_UNPAID = 'unpaid';
    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_FAILED = 'failed';

    public const METHOD_QRPH = 'qrph';
    public const METHOD_COD = 'cod';

    protected $fillable = [
        'customer_id', 'rider_id', 'status', 'total_amount', 'delivery_fee',
        'delivery_address', 'delivery_latitude', 'delivery_longitude',
        'notes', 'estimated_delivery_at', 'delivered_at',
        'paymongo_payment_intent_id', 'paymongo_payment_id', 'payment_status',
        'payment_method',
    ];

    public function isCod(): bool
    {
        return $this->payment_method === self::METHOD_COD;
    }

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
