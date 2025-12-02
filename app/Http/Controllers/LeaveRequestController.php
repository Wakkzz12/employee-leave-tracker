<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveRequestFormRequest;
use App\Models\LeaveRequest;
use App\Models\Employee;
//use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
//use Carbon\Carbon;

class LeaveRequestController extends Controller
{
    /**
     * Display all leave requests
     */
    public function index()
    {
        $leaves = LeaveRequest::with('employee')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($leaves);
    }

    /**
     * Store a new leave request
     */
    public function store(LeaveRequestFormRequest $request)
{
    try {
        $employee = Employee::findOrFail($request->employee_id);

        // Calculate working days using model helper
        $tempLeave = new LeaveRequest([
            'start_leave' => $request->start_leave,
            'end_leave'   => $request->end_leave
        ]);
        $days = $tempLeave->calculateDaysRequested();

        // Check for overlapping approved leaves
        $overlap = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'Approved')
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_leave', [$request->start_leave, $request->end_leave])
                  ->orWhereBetween('end_leave', [$request->start_leave, $request->end_leave]);
            })
            ->exists();

        if ($overlap) {
            // Return consistent error format
            return response()->json([
                'message' => 'Employee already has approved leave during this period.',
                'errors' => [
                    'date_overlap' => ['Employee already has approved leave during this period.']
                ]
            ], 422);
        }

        // Handle file upload if provided
        $filePath = $request->hasFile('proof_file')
            ? $request->file('proof_file')->store('leave_proofs', 'public')
            : null;

        $leave = LeaveRequest::create([
            'employee_id'       => $employee->id,
            'start_leave'       => $request->start_leave,
            'end_leave'         => $request->end_leave,
            'type_of_leave'     => $request->type_of_leave,
            'days_requested'    => $days,
            'remaining_credits' => $employee->leave_balance,
            'proof_file'        => $filePath,
            'status'            => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request created successfully.',
            'data'   => $leave->load('employee'),
        ], 201);
        
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Server error: ' . $e->getMessage(),
            'errors' => [
                'server' => ['An unexpected error occurred']
            ]
        ], 500);
    }
}

    /**
     * Update an existing leave request
     */
    public function update(LeaveRequestFormRequest $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);
        $employee = $leave->employee;


        $days = (new LeaveRequest([
            'start_leave' => $request->start_leave,
            'end_leave'   => $request->end_leave
        ]))->calculateDaysRequested();

        // Balance adjustments depending on status change
        $oldStatus = $leave->status;
        $newStatus = ucfirst(strtolower($request->status));

        if ($newStatus === 'Approved' && $oldStatus !== 'Approved') {
            if (!$employee->deductLeaveBalance($days)) {
                return response()->json(['message' => 'Insufficient leave balance.'], 422);
            }
        } elseif ($oldStatus === 'Approved' && $newStatus !== 'Approved') {
            $employee->restoreLeaveBalance($leave->days_requested);
        }

        // Apply updates
        $leave->update([
            'start_leave'       => $request->start_leave,
            'end_leave'         => $request->end_leave,
            'type_of_leave'     => $request->type_of_leave,
            'days_requested'    => $days,
            'remaining_credits' => $employee->leave_balance,
            'status'            => $newStatus,
            'rejection_reason'  => $request->rejection_reason,
        ]);

        return response()->json([
            'message' => 'Leave request updated successfully.',
            'leave'   => $leave->load('employee'),
        ]);
    }

    /**
     * Soft delete a leave request
     */
    public function destroy($id)
    {
        $leave = LeaveRequest::findOrFail($id);

        if ($leave->proof_file) {
            Storage::disk('public')->delete($leave->proof_file);
        }

        $leave->delete();

        return response()->json(['message' => 'Leave request deleted successfully.']);
    }

    /**
     * Return history of deleted and all leave requests
     */
    public function history()
    {
        $deleted = LeaveRequest::onlyTrashed()
            ->with('employee')
            ->orderBy('deleted_at', 'desc')
            ->get();

        $all = LeaveRequest::withTrashed()
            ->with('employee')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'deletedLeaves' => $deleted,
            'allHistory'    => $all
        ]);
    }

    /**
     * Show history for a specific employee
     */
    public function employeeHistory($employeeId)
    {
        $employee = Employee::findOrFail($employeeId);

        $leaves = LeaveRequest::withTrashed()
            ->where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'employee' => $employee,
            'leaves'   => $leaves
        ]);
    }
}
