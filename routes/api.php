<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveRequestController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route to check authentication
Route::get('/user', function () {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user()
    ]);
})->middleware(['web']);

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Employees
    Route::prefix('employees')->group(function () {
    Route::get('/deleted', [EmployeeController::class, 'deleted']);
    Route::get('/', [EmployeeController::class, 'index']);
    Route::post('/', [EmployeeController::class, 'store']);
    Route::get('/{id}', [EmployeeController::class, 'show'])->whereNumber('id');
    Route::put('/{id}', [EmployeeController::class, 'update'])->whereNumber('id');
    Route::delete('/{id}', [EmployeeController::class, 'destroy'])->whereNumber('id');
    Route::post('/{id}/restore', [EmployeeController::class, 'restore']);
    Route::delete('/{id}/force', [EmployeeController::class, 'forceDelete']);  
});


    // Leave Requests
    Route::prefix('leave-requests')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index']);
        Route::post('/', [LeaveRequestController::class, 'store']);
        Route::put('{id}', [LeaveRequestController::class, 'update']);
        Route::delete('{id}', [LeaveRequestController::class, 'destroy']);
        Route::get('history', [LeaveRequestController::class, 'history']);
        Route::get('employee/{employeeId}', [LeaveRequestController::class, 'employeeHistory']);
    });

});
