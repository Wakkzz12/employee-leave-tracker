<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',     // 👈 must include this
        'name',
        'department',
        'position',
        'started_date',
        'end_date',
        'leave_credits',   // 👈 must include this
        'status',
    ];

    protected $casts = [
        'started_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Relationship: Employee has many leave requests
     */
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Relationship: Only active (non-deleted) leave requests
     */
    public function activeLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)->whereNull('deleted_at');
    }

    /**
     * Decrease leave balance when leave is approved
     */
    public function deductLeaveBalance($days)
    {
        if ($this->leave_balance >= $days) {
            $this->leave_balance -= $days;
            $this->save();
            return true;
        }
        return false;
    }

    /**
     * Restore leave balance if an approved leave is canceled/rejected
     */
    public function restoreLeaveBalance($days)
    {
        $this->leave_balance += $days;
        $this->save();
    }

    /**
     * Ensure leave balance is always non-negative
     */
    public function getLeaveBalanceAttribute($value)
    {
        return max(0, (int) $value);
    }
}
