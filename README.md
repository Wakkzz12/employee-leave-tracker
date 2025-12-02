Employee Leave Tracker System
📋 Overview
A comprehensive leave management system for AsiaPro Butuan employees, featuring employee management, leave request processing, and reporting capabilities.

Features
Authentication & Security
Email-based authentication with @asiaprobutuan.com domain validation

CSRF token protection for all form submissions

Session-based authentication using Laravel Sanctum

Employee Management
Complete employee CRUD operations

Department and position tracking

Leave credits management

Employee status tracking (regular, permanent, contractual, etc.)

Soft delete functionality with restore options

Leave Management
Multiple leave types: Sick, Vacation, Emergency, Maternity, Paternity, Bereavement, Unpaid

Leave request submission with date validation

File upload support for leave proof (PDF, PNG, JPG)

Leave approval/rejection workflow

Overlapping leave prevention

📊 Dashboard & Reporting
Real-time statistics dashboard

Employee leave history tracking

Deleted records management

Recent activity monitoring

🛠️ Technology Stack
Backend
Laravel 10+ - PHP framework

MySQL - Database

Laravel Sanctum - API authentication

Eloquent ORM - Database operations

Frontend
Vanilla JavaScript - No framework dependencies

CSS3 - Custom styling with CSS variables

Fetch API - Modern HTTP requests

Modular JavaScript - Organized code structure

Key Packages
laravel/sanctum - API authentication

Soft deletes - Data recovery capability

Carbon - Date manipulation


⚙️ Installation
Prerequisites
PHP 8.1+

Composer

MySQL 5.7+

Node.js (for frontend dependencies if any)

Setup Steps
Clone the repository

git clone <repository-url>
cd leave-tracker-system

Install PHP dependencies

composer install

Configure environment

cp .env.example .env
php artisan key:generate
