<?php

// routes/web.php
use Illuminate\Support\Facades\Route;

// Only the home route
Route::get('/', function () {
    return view('app');
});

// Sanctum CSRF cookie route (must be in web.php)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');