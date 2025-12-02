<?php

/*
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        // Prevent duplicate seeding
        if (Employee::count() > 0) {
            $this->command->info('Employees table already seeded.');
            return;
        }

        $statuses = ['regular', 'permanent', 'contractual'];

        for ($i = 1; $i <= 10; $i++) {
            Employee::create([
                'employee_id' => sprintf('EMP%04d', $i),
                'name' => "Test Employee {$i}",
                'started_date' => Carbon::now()->subYears(rand(1, 5))->format('Y-m-d'),
                'leave_credits' => rand(10, 20),
                'status' => $statuses[array_rand($statuses)],
            ]);
        }

        $this->command->info('✅ 10 sample employees successfully seeded!');
    }
}
