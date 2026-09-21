<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('week', 20);
            $table->date('submission_date');
            $table->string('file', 50);
            $table->string('status', 20);
            $table->string('comment', 100)->nullable();

            $table->foreignId('supervisor_id')
                  ->constrained('supervisors')
                  ->onDelete('cascade');

            $table->foreignId('intern_id')
                  ->constrained('interns')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};