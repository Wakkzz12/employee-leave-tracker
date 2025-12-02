<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    if (!Schema::hasTable('employees')) {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('name');
            $table->date('started_date');
            $table->date('end_date')->nullable();
            $table->integer('leave_credits')->default(15);
            $table->enum('status', ['regular', 'permanent', 'contractual', 'resigned', 'terminated', 'awol', 'retired'])->default('contractual');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    if (!Schema::hasTable('leave_requests')) {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('start_leave');
            $table->date('end_leave');
            $table->enum('type_of_leave', ['sick', 'vacation', 'emergency', 'maternity', 'paternity', 'bereavement', 'unpaid']);
            $table->integer('days_requested');
            $table->integer('remaining_credits');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('proof_file')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
}


    public function down()
    {
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('users');
    }
};