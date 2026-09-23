<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #1e293b; margin: 40px; font-size: 13px; }
        h1 { font-size: 22px; color: #4f46e5; margin-bottom: 5px; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
        .meta { margin-bottom: 20px; }
        .meta span { display: inline-block; width: 160px; font-weight: bold; color: #475569; }
        .content-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 15px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-valide { background: #d1fae5; color: #065f46; }
        .status-rejete { background: #fee2e2; color: #991b1b; }
        .status-attente { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport de stage</h1>
        <p style="color: #64748b; margin: 0;">Stagio — Plateforme de gestion de stage</p>
    </div>

    <div class="meta">
        <p><span>Semaine :</span> {{ $report->week ?? '—' }}</p>
        <p><span>Date de soumission :</span> {{ $report->submission_date ?? '—' }}</p>
        <p><span>Stagiaire :</span>
            {{ $report->intern?->user?->first_name ?? '—' }}
            {{ $report->intern?->user?->last_name ?? '' }}
        </p>
        <p><span>Encadreur :</span>
            {{ $report->supervisor?->user?->first_name ?? '—' }}
            {{ $report->supervisor?->user?->last_name ?? '' }}
        </p>
        <p><span>Statut :</span>
            @php
                $statutClass = match($report->status) {
                    'Valide' => 'status-valide',
                    'Rejete' => 'status-rejete',
                    default => 'status-attente',
                };
            @endphp
            <span class="status {{ $statutClass }}">{{ $report->status ?? 'En attente' }}</span>
        </p>
        @if($report->comment)
            <p><span>Commentaire :</span> {{ $report->comment }}</p>
        @endif
    </div>

    <h2 style="font-size: 16px; color: #475569; margin-bottom: 10px;">Contenu du rapport</h2>
    <div class="content-box">
        {!! nl2br(e($report->content ?? '—')) !!}
    </div>

    <div class="footer">
        <p>Généré le {{ now()->format('d/m/Y à H:i') }} — Stagio</p>
    </div>
</body>
</html>