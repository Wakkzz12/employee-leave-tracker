<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->unique()->after('email');
            $table->string('department')->nullable()->after('employee_id');
            $table->string('position')->nullable()->after('department');
            $table->date('started_date')->nullable()->after('position');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('started_date');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['employee_id', 'department', 'position', 'started_date', 'status']);
        });
    }
};