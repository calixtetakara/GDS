<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->foreignId('supervisor_id')->nullable()->change();
            $table->foreignId('user_id')->nullable()->change();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('supervisor_id')->nullable()->change();
            $table->foreignId('intern_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->foreignId('supervisor_id')->nullable(false)->change();
            $table->foreignId('user_id')->nullable(false)->change();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('supervisor_id')->nullable(false)->change();
            $table->foreignId('intern_id')->nullable(false)->change();
        });
    }
};