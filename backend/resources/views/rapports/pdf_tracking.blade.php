<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #1e293b; margin: 40px; font-size: 13px; }
        h1 { font-size: 22px; color: #4f46e5; margin-bottom: 5px; }
        h2 { font-size: 16px; color: #475569; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        h3 { font-size: 14px; color: #4f46e5; margin-top: 20px; margin-bottom: 8px; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
        .info-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; flex: 1; min-width: 200px; }
        .info-card .label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
        .info-card .value { font-size: 15px; font-weight: bold; color: #1e293b; }
        .stats { display: flex; gap: 10px; margin-bottom: 25px; }
        .stat-box { background: #f1f5f9; border-radius: 8px; padding: 12px 18px; text-align: center; flex: 1; }
        .stat-box .number { font-size: 22px; font-weight: bold; color: #4f46e5; }
        .stat-box .label { font-size: 11px; color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 12px; }
        th { background: #f1f5f9; color: #475569; font-weight: bold; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .status-valide { background: #d1fae5; color: #065f46; }
        .status-rejete { background: #fee2e2; color: #991b1b; }
        .status-attente { background: #fef3c7; color: #92400e; }
        .status-termine { background: #dbeafe; color: #1e40af; }
        .status-cours { background: #e0e7ff; color: #3730a3; }
        .status-afaire { background: #f1f5f9; color: #475569; }
        .report { margin-bottom: 20px; page-break-inside: avoid; }
        .report-header { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
        .content-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 12px; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .separator { border-top: 1px solid #e2e8f0; margin: 25px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Suivi de stage</h1>
        <p style="color: #64748b; margin: 0;">Stagio — Plateforme de gestion de stage</p>
        <p style="color: #64748b; margin: 5px 0 0 0;">Généré le {{ now()->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="info-grid">
        <div class="info-card">
            <div class="label">Stagiaire</div>
            <div class="value">{{ $intern->user->first_name }} {{ $intern->user->last_name }}</div>
        </div>
        <div class="info-card">
            <div class="label">Email</div>
            <div class="value">{{ $intern->user->email }}</div>
        </div>
        <div class="info-card">
            <div class="label">Encadreur</div>
            <div class="value">{{ $intern->supervisor?->user?->first_name }} {{ $intern->supervisor?->user?->last_name }}</div>
        </div>
        <div class="info-card">
            <div class="label">Formation</div>
            <div class="value">{{ $intern->training }} — {{ $intern->level }}</div>
        </div>
        <div class="info-card">
            <div class="label">Institution</div>
            <div class="value">{{ $intern->institution }}</div>
        </div>
        <div class="info-card">
            <div class="label">Téléphone</div>
            <div class="value">{{ $intern->user->phone ?? '—' }}</div>
        </div>
    </div>

    <div class="stats">
        <div class="stat-box">
            <div class="number">{{ $reports->count() }}</div>
            <div class="label">Rapports</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $reports->where('status', 'Valide')->count() }}</div>
            <div class="label">Validés</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $reports->where('status', 'En attente')->count() }}</div>
            <div class="label">En attente</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $reports->where('status', 'Rejete')->count() }}</div>
            <div class="label">Rejetés</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $projects->count() }}</div>
            <div class="label">Projets</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $tasks->count() }}</div>
            <div class="label">Tâches</div>
        </div>
    </div>

    <h2>Projets</h2>
    @if($projects->isEmpty())
        <p style="color: #94a3b8; font-size: 12px;">Aucun projet assigné.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Projet</th>
                    <th>Description</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($projects as $project)
                    <tr>
                        <td><strong>{{ $project->name }}</strong></td>
                        <td>{{ $project->description }}</td>
                        <td>{{ $project->start_date->format('d/m/Y') }}</td>
                        <td>{{ $project->end_date->format('d/m/Y') }}</td>
                        <td>
                            @php
                                $projClass = match($project->status) {
                                    'Termine' => 'status-termine',
                                    'En cours' => 'status-cours',
                                    default => 'status-afaire',
                                };
                            @endphp
                            <span class="status {{ $projClass }}">{{ $project->status }}</span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Tâches</h2>
    @if($tasks->isEmpty())
        <p style="color: #94a3b8; font-size: 12px;">Aucune tâche assignée.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Tâche</th>
                    <th>Projet</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($tasks as $task)
                    <tr>
                        <td><strong>{{ $task->name }}</strong></td>
                        <td>{{ $task->project->name }}</td>
                        <td>{{ $task->start_date->format('d/m/Y') }}</td>
                        <td>{{ $task->end_date->format('d/m/Y') }}</td>
                        <td>
                            @php
                                $taskClass = match($task->status) {
                                    'Termine' => 'status-termine',
                                    'En cours' => 'status-cours',
                                    default => 'status-afaire',
                                };
                            @endphp
                            <span class="status {{ $taskClass }}">{{ $task->status }}</span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="separator"></div>

    <h2>Rapports hebdomadaires ({{ $reports->count() }})</h2>
    @forelse($reports as $report)
        <div class="report">
            <div class="report-header">
                <strong>{{ $report->week }}</strong> — {{ $report->submission_date->format('d/m/Y') }}
                @php
                    $statutClass = match($report->status) {
                        'Valide' => 'status-valide',
                        'Rejete' => 'status-rejete',
                        default => 'status-attente',
                    };
                @endphp
                <span class="status {{ $statutClass }}" style="margin-left: 10px;">{{ $report->status }}</span>
                @if($report->comment)
                    <span style="color: #64748b; margin-left: 10px;">— {{ $report->comment }}</span>
                @endif
            </div>
            <div class="content-box">
                {!! nl2br(e($report->content)) !!}
            </div>
        </div>
    @empty
        <p style="color: #94a3b8; font-size: 12px;">Aucun rapport pour le moment.</p>
    @endforelse

    <div class="footer">
        <p>Stagio — Suivi de {{ $intern->user->first_name }} {{ $intern->user->last_name }} — {{ now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>
