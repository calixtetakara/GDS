<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre compte a été créé</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 24px 32px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
        .body { padding: 32px; }
        .body p { font-size: 14px; line-height: 1.6; }
        .box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .box div { font-size: 14px; padding: 4px 0; }
        .box .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
        .footer { background: #f1f5f9; padding: 16px 32px; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue {{ $user->first_name }} !</h1>
        </div>
        <div class="body">
            <p>Un administrateur vient de créer votre compte sur la plateforme <strong>Stagio</strong>.</p>

            <div class="box">
                <div><span class="label">Prénom</span><br> {{ $user->first_name }}</div>
                <div><span class="label">Nom</span><br> {{ $user->last_name }}</div>
                <div><span class="label">Email</span><br> {{ $user->email }}</div>
                <div><span class="label">Mot de passe</span><br> {{ $password }}</div>
                <div><span class="label">Rôle</span><br> {{ implode(', ', $user->getRoleNames()->toArray()) }}</div>
            </div>

            <p>N'hésitez pas à modifier votre mot de passe après votre première connexion depuis votre page de profil.</p>
        </div>
        <div class="footer">
            Plateforme de gestion de stages — Stagio
        </div>
    </div>
</body>
</html>