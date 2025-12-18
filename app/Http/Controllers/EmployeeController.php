<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Get soft-deleted employees
     */
    public function deleted()
    {
        // Debug: Log request
        /* \Log::info('Fetching deleted employees', [
            'user_id' => auth()->id(),
            'user' => auth()->user() ? auth()->user()->email : 'null'
        ]); */
        
        try {
            // Get soft-deleted employees
            $deletedEmployees = Employee::onlyTrashed()
                ->orderBy('deleted_at', 'desc')
                ->get();
            
            /* \Log::info('Found deleted employees:', ['count' => $deletedEmployees->count()]); */
            
            return response()->json([
                'success' => true,
                'data' => $deletedEmployees,
                'count' => $deletedEmployees->count()
            ]);
        } catch (\Exception $e) {
            /* \Log::error('Error in deleted(): ' . $e->getMessage()); */
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deleted employees',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    
    /**
     * Get active employees
     */
    public function index()
    {
        try {
            $employees = Employee::whereNull('deleted_at')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch employees'
            ], 500);
        }
    }
    
    /**
     * Store a new employee
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|string|max:50|unique:employees,employee_id,NULL,id,deleted_at,NULL',
            'name' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'started_date' => 'required|date',
            'end_date' => 'nullable|date',
            'leave_balance' => 'required|integer|min:0',
            'status' => 'required|in:regular,permanent,contractual,resigned,terminated,awol,retired'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $employee = Employee::create($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee created successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee'
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
    try {
        $employee = Employee::findOrFail($id);
        
        // Only validate fields that are present in the request
        $rules = [];
        
        if ($request->has('employee_id')) {
            $rules['employee_id'] = 'required|string|max:50|unique:employees,employee_id,' . $id . ',id,deleted_at,NULL';
        }
        
        if ($request->has('name')) {
            $rules['name'] = 'required|string|max:255';
        }
        
        if ($request->has('department')) {
            $rules['department'] = 'nullable|string|max:100';
        }
        
        if ($request->has('position')) {
            $rules['position'] = 'nullable|string|max:100';
        }
        
        if ($request->has('started_date')) {
            $rules['started_date'] = 'required|date';
        }
        
        if ($request->has('end_date')) {
            $rules['end_date'] = 'nullable|date';
        }
        
        if ($request->has('leave_balance')) {
            $rules['leave_credits'] = 'required|integer|min:0';
        }
        
        if ($request->has('status')) {
            $rules['status'] = 'required|in:regular,permanent,contractual,resigned,terminated,awol,retired';
        }
        
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Update only fields that are present in the request
        $employee->fill($request->only([
            'employee_id', 'name', 'department', 'position', 
            'started_date', 'end_date', 'leave_balance', 'status'
        ]));
        
        $employee->save();
        
        return response()->json([
            'success' => true,
            'data' => $employee,
            'message' => 'Employee updated successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update employee'
        ], 500);
    }
}
    /**
     * Soft delete an employee
     */
    public function destroy($id)
    {
        try {
            $employee = Employee::findOrFail($id);
            $employee->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Employee soft-deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee'
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted employee
     */
    public function restore($id)
    {
        try {
            $employee = Employee::onlyTrashed()->findOrFail($id);
            $employee->restore();
            
            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee restored successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore employee'
            ], 500);
        }
    }
    
    /**
     * Permanently delete an employee
     */
    public function forceDelete($id)
    {
        try {
            $employee = Employee::onlyTrashed()->findOrFail($id);
            $employee->forceDelete();
            
            return response()->json([
                'success' => true,
                'message' => 'Employee permanently deleted'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete employee'
            ], 500);
        }
    }
}