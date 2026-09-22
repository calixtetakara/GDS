<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite ne supporte pas ALTER COLUMN → on recrée la table
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off');

            Schema::table('interns', function (Blueprint $table) {
                $table->date('date_of_birth')->nullable()->change();
            });

            DB::statement('PRAGMA foreign_keys=on');
        } else {
            Schema::table('interns', function (Blueprint $table) {
                $table->date('date_of_birth')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off');

            Schema::table('interns', function (Blueprint $table) {
                $table->date('date_of_birth')->nullable(false)->change();
            });

            DB::statement('PRAGMA foreign_keys=on');
        } else {
            Schema::table('interns', function (Blueprint $table) {
                $table->date('date_of_birth')->nullable(false)->change();
            });
        }
    }
};