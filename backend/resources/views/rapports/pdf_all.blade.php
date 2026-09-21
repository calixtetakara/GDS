<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #1e293b; margin: 40px; font-size: 13px; }
        h1 { font-size: 22px; color: #4f46e5; margin-bottom: 5px; }
        h2 { font-size: 15px; color: #475569; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
        .report { margin-bottom: 25px; page-break-inside: avoid; }
        .meta { margin-bottom: 10px; }
        .meta span { display: inline-block; width: 140px; font-weight: bold; color: #475569; }
        .content-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 8px; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .status-valide { background: #d1fae5; color: #065f46; }
        .status-rejete { background: #fee2e2; color: #991b1b; }
        .status-attente { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 12px; }
        th { background: #f1f5f9; color: #475569; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tous mes rapports de stage</h1>
        <p style="color: #64748b; margin: 0;">Stagio — Plateforme de gestion de stage</p>
        <p style="color: #64748b; margin: 5px 0 0 0;">Stagiaire : {{ $intern->user->first_name }} {{ $intern->user->last_name }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Semaine</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Commentaire</th>
            </tr>
        </thead>
        <tbody>
            @forelse($reports as $report)
                <tr>
                    <td>{{ $report->week }}</td>
                    <td>{{ $report->submission_date }}</td>
                    <td>
                        @php
                            $statutClass = match($report->status) {
                                'Valide' => 'status-valide',
                                'Rejete' => 'status-rejete',
                                default => 'status-attente',
                            };
                        @endphp
                        <span class="status {{ $statutClass }}">{{ $report->status }}</span>
                    </td>
                    <td>{{ $report->comment ?? '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="4" style="text-align:center;">Aucun rapport</td></tr>
            @endforelse
        </tbody>
    </table>

    @foreach($reports as $report)
        <div class="report">
            <h2>{{ $report->week }}</h2>
            <div class="meta">
                <p><span>Encadreur :</span> {{ $report->supervisor->user->first_name }} {{ $report->supervisor->user->last_name }}</p>
            </div>
            <div class="content-box">
                {!! nl2br(e($report->content)) !!}
            </div>
        </div>
    @endforeach

    <div class="footer">
        <p>Généré le {{ now()->format('d/m/Y à H:i') }} — {{ $reports->count() }} rapport(s) — Stagio</p>
    </div>
</body>
</html>
