<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Force JSON response for API requests
        if ($request->is('api/*')) {
            return response()->json([
                'message' => $exception->getMessage(),
                'error' => class_basename($exception),
                'status' => $this->getStatusCode($exception)
            ], $this->getStatusCode($exception));
        }

        return parent::render($request, $exception);
    }

    /**
     * Get HTTP status code from exception
     */
    protected function getStatusCode(Throwable $exception)
    {
        return method_exists($exception, 'getStatusCode') 
            ? $exception->getStatusCode() 
            : 500;
    }
}