<?php


/*
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {

        User::create([
        'name' => 'Head of Office',
        'email' => 'admin@asiaprobutuan.com',
        'password' => bcrypt('password123')
    ]);

     $this->call(EmployeeSeeder::class);

    }
}
