<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class LeaveRequest extends Model
{
    use SoftDeletes, HasFactory;

    const STATUSES = ['pending', 'approved', 'rejected'];
    protected $fillable = [
        'employee_id',
        'start_leave',
        'end_leave',
        'type_of_leave',
        'days_requested',
        'remaining_credits',
        'status',
        'proof_file',
        'rejection_reason'
    ];

    protected $casts = [
        'start_leave' => 'date',
        'end_leave' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function calculateDaysRequested()
    {
        $start = Carbon::parse($this->start_leave);
        $end = Carbon::parse($this->end_leave);
        
        $days = 0;
        while ($start->lte($end)) {
            if ($start->isWeekday()) {
                $days++;
            }
            $start->addDay();
        }
        
        return $days;
    }
}