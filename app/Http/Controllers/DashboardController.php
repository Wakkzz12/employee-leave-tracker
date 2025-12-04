<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Ensure case consistency — database usually stores statuses with uppercase initials
            $totalEmployees = Employee::whereNull('deleted_at')->count(); // Only count active employees
            $totalPending   = LeaveRequest::where('status', 'Pending')->count();
            $totalApproved  = LeaveRequest::where('status', 'Approved')->count();
            $totalRejected  = LeaveRequest::where('status', 'Rejected')->count();

            // Count soft-deleted only if model uses SoftDeletes trait
            $totalDeleted = method_exists(LeaveRequest::class, 'bootSoftDeletes')
                ? LeaveRequest::onlyTrashed()->count()
                : 0;

            // Load the 10 most recent leave requests with employee relationship
            $recentRequests = LeaveRequest::with('employee')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'employee' => [
                            'id' => $req->employee->id ?? null,
                            'name' => $req->employee->name ?? 'Unknown',
                            'employee_id' => $req->employee->employee_id ?? 'N/A'
                        ],
                        'type_of_leave' => $req->type_of_leave ?? 'N/A',
                        'start_leave' => $req->start_leave, // FIXED: was start_date
                        'end_leave' => $req->end_leave,     // FIXED: was end_date
                        'status' => $req->status,
                        'days_requested' => $req->days_requested ?? 0,
                        'remaining_credits' => $req->employee->leave_balance ?? null,
                        'created_at' => $req->created_at->toDateTimeString()
                    ];
                });

            // Return JSON response for dashboard.js
            return response()->json([
                'success' => true,
                'totalEmployees' => $totalEmployees,
                'totalPending'   => $totalPending,
                'totalApproved'  => $totalApproved,
                'totalRejected'  => $totalRejected,
                'totalDeleted'   => $totalDeleted,
                'recentRequests' => $recentRequests
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
}