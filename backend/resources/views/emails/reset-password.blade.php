<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 32px;">
    <h1 style="color: #1e293b;">Réinitialisation de mot de passe</h1>
    <p>Bonjour {{ $user->first_name ?? 'Utilisateur' }},</p>
    <p>Tu as demandé à réinitialiser ton mot de passe sur <strong>Stagio</strong>.</p>
    <p>Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="{{ $url }}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="font-size: 12px; color: #64748b;">
      Ce lien expire dans 60 minutes. Si tu n'es pas à l'origine de cette demande, ignore cet email.
    </p>
  </div>
</body>
</html>