# Documentation des routes — Authentification

Ce document liste toutes les routes nécessaires à l'authentification de l'application,
fournies par Laravel Breeze (React + Inertia).

## 1. Connexion / Déconnexion

### GET /login
- **Nom :** `login`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\AuthenticatedSessionController@create`
- **Description :** Affiche le formulaire de connexion.

### POST /login
- **Middleware :** `guest`
- **Contrôleur :** `Auth\AuthenticatedSessionController@store`
- **Description :** Authentifie un utilisateur à partir de son email et mot de passe.
- **Données attendues :**

| Champ    | Type    | Obligatoire |
|----------|---------|-------------|
| email    | string  | Oui         |
| password | string  | Oui         |
| remember | boolean | Non         |

- **Résultat :** redirection vers `/dashboard` si succès, erreur de validation sinon.

### POST /logout
- **Nom :** `logout`
- **Middleware :** `auth`
- **Contrôleur :** `Auth\AuthenticatedSessionController@destroy`
- **Description :** Déconnecte l'utilisateur, détruit la session, régénère le token CSRF.

---

## 2. Inscription

### GET /register
- **Nom :** `register`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\RegisteredUserController@create`
- **Description :** Affiche le formulaire d'inscription.

### POST /register
- **Middleware :** `guest`
- **Contrôleur :** `Auth\RegisteredUserController@store`
- **Description :** Crée un nouvel utilisateur et le connecte automatiquement.

---

## 3. Réinitialisation du mot de passe

### GET /forgot-password
- **Nom :** `password.request`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\PasswordResetLinkController@create`
- **Description :** Affiche le formulaire "mot de passe oublié".

### POST /forgot-password
- **Nom :** `password.email`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\PasswordResetLinkController@store`
- **Description :** Envoie un email contenant un lien de réinitialisation.

### GET /reset-password/{token}
- **Nom :** `password.reset`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\NewPasswordController@create`
- **Description :** Affiche le formulaire de saisie du nouveau mot de passe.

### POST /reset-password
- **Nom :** `password.store`
- **Middleware :** `guest`
- **Contrôleur :** `Auth\NewPasswordController@store`
- **Description :** Enregistre le nouveau mot de passe.

### PUT /password
- **Nom :** `password.update`
- **Middleware :** `auth`
- **Contrôleur :** `Auth\PasswordController@update`
- **Description :** Modifie le mot de passe d'un utilisateur déjà connecté.

---

## 4. Vérification de l'email

### GET /verify-email
- **Nom :** `verification.notice`
- **Middleware :** `auth`
- **Contrôleur :** `Auth\EmailVerificationPromptController`
- **Description :** Affiche un message demandant de vérifier son email.

### GET /verify-email/{id}/{hash}
- **Nom :** `verification.verify`
- **Middleware :** `auth`, `signed`
- **Contrôleur :** `Auth\VerifyEmailController`
- **Description :** Valide l'adresse email via le lien reçu par mail.

### POST /email/verification-notification
- **Nom :** `verification.send`
- **Middleware :** `auth`
- **Contrôleur :** `Auth\EmailVerificationNotificationController@store`
- **Description :** Renvoie un email de vérification.

---

## 5. Confirmation du mot de passe

### GET /confirm-password
- **Nom :** `password.confirm`
- **Middleware :** `auth`
- **Contrôleur :** `Auth\ConfirmablePasswordController@show`
- **Description :** Affiche un formulaire redemandant le mot de passe avant une action sensible.

### POST /confirm-password
- **Middleware :** `auth`
- **Contrôleur :** `Auth\ConfirmablePasswordController@store`
- **Description :** Vérifie le mot de passe saisi.

---

## 6. Routes dépendantes de l'authentification

### GET /dashboard
- **Nom :** `dashboard`
- **Middleware :** `auth`, `verified`
- **Description :** Affiche le tableau de bord de l'utilisateur connecté.

### GET /profile
- **Nom :** `profile.edit`
- **Middleware :** `auth`
- **Contrôleur :** `ProfileController@edit`
- **Description :** Affiche le formulaire de modification du profil.

### PATCH /profile
- **Nom :** `profile.update`
- **Middleware :** `auth`
- **Contrôleur :** `ProfileController@update`
- **Description :** Met à jour les informations du profil.

### DELETE /profile
- **Nom :** `profile.destroy`
- **Middleware :** `auth`
- **Contrôleur :** `ProfileController@destroy`
- **Description :** Supprime le compte de l'utilisateur connecté.

---

# Documentation des routes — API (Sanctum)

Ces routes permettent l'authentification via **token API** (Laravel Sanctum),
utilisées pour les clients externes (Postman, applications mobiles, futures
intégrations front découplées). Elles sont distinctes des routes web
(sessions/cookies) documentées plus haut.

Toutes les routes API sont préfixées automatiquement par `/api`.

## 1. Connexion API

### POST /api/login
- **Contrôleur :** `Api\AuthController@login`
- **Middleware :** Aucun (route publique)
- **Description :** Authentifie un utilisateur via email/mot de passe et renvoie un token Sanctum.

**Données attendues :**

| Champ    | Type   | Obligatoire |
|----------|--------|-------------|
| email    | string | Oui         |
| password | string | Oui         |

**Réponse en cas de succès (200) :**
```json
{
    "user": {
        "id": 1,
        "first_name": "Administrateur",
        "last_name": "Admin",
        "email": "admin@example.com",
        "roles": ["Admin"]
    },
    "token": "2|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Réponse en cas d'échec (422) :** erreur de validation si l'email ou le mot de passe est incorrect.

---

## 2. Déconnexion API

### POST /api/logout
- **Contrôleur :** `Api\AuthController@logout`
- **Middleware :** `auth:sanctum`
- **Description :** Supprime le token actuellement utilisé pour la requête, déconnectant l'utilisateur de l'API.
- **Authentification requise :** header `Authorization: Bearer {token}`

**Réponse en cas de succès (200) :**
```json
{
    "message": "Déconnexion réussie."
}
```

**Réponse si le token est absent ou invalide (401) :**
```json
{
    "message": "Unauthenticated."
}
```

---

## 3. Utilisateur connecté (API)

### GET /api/user
- **Middleware :** `auth:sanctum`
- **Description :** Renvoie les informations de l'utilisateur actuellement authentifié via son token.
- **Authentification requise :** header `Authorization: Bearer {token}`

**Réponse en cas de succès (200) :** les données du modèle `User` connecté.

**Réponse si le token est absent, invalide, ou révoqué (401) :**
```json
{
    "message": "Unauthenticated."
}
```

---

## 4. Route de test

### GET /api/ping
- **Middleware :** Aucun
- **Description :** Route de vérification simple utilisée pour confirmer que le fichier `routes/api.php`
  est bien chargé par Laravel. Peut être supprimée une fois le développement de l'API avancé.

**Réponse :**
```json
{
    "message": "API fonctionnelle"
}
```