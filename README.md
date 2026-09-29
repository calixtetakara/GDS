# Stagio — Plateforme de Gestion des Stagiaires

Application web de gestion complète des stages : suivi des stagiaires, encadreurs, projets, tâches, rapports hebdomadaires et génération de documents PDF.

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Rôles et permissions](#rôles-et-permissions)
- [Référence API](#référence-api)
- [Import CSV en masse](#import-csv-en-masse)
- [Déploiement](#déploiement)
- [Dépannage](#dépannage)
- [Contribution](#contribution)
- [Licence](#licence)
- [Auteur](#auteur)

---

## Présentation

**Stagio** est une plateforme web conçue pour faciliter la gestion administrative et pédagogique des stages en entreprise ou en institution. Elle centralise les informations relatives aux stagiaires, encadreurs, projets et rapports, tout en automatisant les tâches répétitives telles que la création de comptes, l'envoi d'identifiants et la génération de documents.

L'application s'articule autour de trois profils utilisateurs distincts, chacun disposant d'une interface et de permissions adaptées à son rôle.

---

## Fonctionnalités

### Authentification et sécurité

- Authentification par jetons via Laravel Sanctum
- Procédure de mot de passe oublié avec envoi d'un lien sécurisé par email
- Réinitialisation de mot de passe avec jeton à durée d'expiration limitée
- Gestion granulaire des rôles et permissions via Spatie Laravel Permission
- Envoi automatique des identifiants lors de la création d'un compte stagiaire

### Gestion des stagiaires

- Création, modification et suppression de fiches stagiaires
- Informations gérées : nom, prénom, adresse email, domaine de formation, institut de provenance, niveau d'étude, type de stage (hybride, en ligne, sur site), dates de début et de fin
- Génération automatique d'un mot de passe temporaire
- Notification par email des identifiants de connexion
- Recherche et filtres dynamiques

### Gestion des encadreurs

- Affectation des encadreurs aux stagiaires
- Suivi des tâches et des rapports rattachés

### Gestion des projets

- Création de projets avec dates de début, de fin et statut
- Affectation de stagiaires à un projet
- Vue synthétique du nombre de stagiaires par projet
- Fiche détaillée affichant les encadrants affectés

### Gestion des tâches

- Création des tâches réservée aux encadreurs
- Affectation d'une tâche à un stagiaire membre du projet concerné
- Gestion des statuts : à faire, en cours, terminé
- Importation en masse depuis un fichier CSV
- Téléchargement d'un modèle CSV pré-rempli
- Validation des dates de début et de fin

### Rapports hebdomadaires

- Dépôt de rapports par les stagiaires, avec pièce jointe facultative
- Aperçu du contenu avant validation
- Validation ou rejet par les encadreurs, avec commentaire
- Génération de documents PDF :
  - rapport individuel ;
  - suivi complet d'un stagiaire (projets, tâches et rapports) ;
  - export global.

### Notifications

- Compteur de notifications non lues
- Marquage individuel ou global comme lu

### Profil utilisateur

- Modification des informations personnelles
- Changement de mot de passe
- Affichage du type de stage et de la période associée

---

## Stack technique

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Laravel | 11.x | Framework applicatif |
| PHP | 8.4+ | Langage serveur |
| Laravel Sanctum | 4.x | Authentification API |
| Spatie Permission | 6.x | Rôles et permissions |
| DomPDF | 3.x | Génération de PDF |
| Doctrine DBAL | 4.x | Migrations avancées |
| SQLite / MySQL | — | Base de données |

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.x | Bibliothèque d'interface |
| Vite | 5.x | Outil de build |
| React Router | 6.x | Routage côté client |
| Tailwind CSS | 3.x | Framework CSS |
| Axios | 1.x | Client HTTP |
| Lucide React | — | Bibliothèque d'icônes |

---

## Architecture du projet

```text
Gestion-des-Stagiaires/
├── backend/                          # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/      # Contrôleurs API
│   │   │   └── Middleware/
│   │   ├── Mail/                     # Classes d'envoi d'emails
│   │   └── Models/                   # Modèles Eloquent
│   ├── config/                       # Fichiers de configuration
│   ├── database/
│   │   ├── migrations/               # Migrations de base
│   │   └── seeders/                  # Données initiales
│   ├── resources/views/
│   │   ├── emails/                   # Templates d'emails
│   │   └── rapports/                 # Templates PDF
│   └── routes/
│       └── api.php                   # Définition des routes API
│
└── frontend/                         # Application React
    ├── src/
    │   ├── api/                      # Services d'appel API
    │   ├── components/               # Composants réutilisables
    │   ├── pages/                    # Pages de l'application
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Installation

### Prérequis

- PHP 8.2 ou supérieur avec les extensions : `pdo`, `pdo_sqlite`, `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip`
- Composer 2.5 ou supérieur
- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Git

### Cloner le dépôt

```bash
git clone https://github.com/votre-username/Gestion-des-Stagiaires.git
cd Gestion-des-Stagiaires
```

### Installer le backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Créer la base de données SQLite

```bash
# Windows (PowerShell)
New-Item database\database.sqlite -ItemType File

# Linux / macOS
touch database/database.sqlite
```

### Appliquer les migrations et les données initiales

```bash
php artisan migrate --seed
```

### Installer le frontend

```bash
cd ../frontend
npm install
```

---

## Configuration

### Variables d'environnement backend

Éditer le fichier `backend/.env` :

```env
APP_NAME=Stagio
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=sqlite

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=mot-de-passe-application
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="votre-email@gmail.com"
MAIL_FROM_NAME="Stagio"
```

### Configuration Gmail

1. Accéder à https://myaccount.google.com/security
2. Activer la validation en deux étapes
3. Accéder à https://myaccount.google.com/apppasswords
4. Créer un mot de passe d'application nommé « Stagio »
5. Copier les seize caractères générés dans la variable `MAIL_PASSWORD`

**Remarque :** les espaces présents dans le mot de passe généré par Google doivent être supprimés dans le fichier `.env`.

### Variables d'environnement frontend

Créer le fichier `frontend/.env` :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Configuration PHP pour les téléversements

Afin de permettre l'importation de fichiers CSV, la configuration suivante est requise dans `php.ini` :

```ini
upload_tmp_dir = "chemin/vers/backend/storage/tmp"
upload_max_filesize = 10M
post_max_size = 12M
file_uploads = On
```

Le redémarrage du serveur PHP est nécessaire après toute modification.

---

## Utilisation

### Démarrer l'application

**Terminal 1 — Backend :**

```bash
cd backend
php artisan serve
```

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

L'application est accessible à l'adresse : http://localhost:5173

### Comptes de démonstration

Après l'exécution de `php artisan db:seed` :

| Rôle | Adresse email | Mot de passe |
|------|---------------|--------------|
| Administrateur | admin@stagio.com | password |
| Encadreur | encadreur@stagio.com | password |
| Stagiaire | stagiaire@stagio.com | password |

**Important :** ces identifiants doivent impérativement être modifiés avant tout déploiement en production.

---

## Rôles et permissions

### Administrateur

- Gestion complète des utilisateurs
- Gestion complète des stagiaires
- Gestion complète des encadreurs
- Gestion complète des projets
- Consultation de l'ensemble des tâches et rapports
- Validation des rapports
- Affectation des stagiaires aux projets

### Encadreur

- Consultation de ses stagiaires et de ses projets
- Création, modification et suppression de tâches
- Importation de tâches en masse
- Consultation et validation des rapports de ses stagiaires

### Stagiaire

- Consultation de ses tâches
- Dépôt de ses rapports hebdomadaires
- Téléchargement de ses rapports au format PDF
- Modification de son profil

---

## Référence API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/login` | Connexion |
| POST | `/api/logout` | Déconnexion |
| GET | `/api/user` | Utilisateur authentifié |
| PUT | `/api/profile` | Mise à jour du profil |
| POST | `/api/forgot-password` | Demande de réinitialisation |
| POST | `/api/reset-password` | Réinitialisation effective |

### Ressources principales

| Méthode | Endpoint | Rôle requis |
|---------|----------|-------------|
| GET | `/api/interns` | Administrateur, Encadreur |
| POST | `/api/interns` | Administrateur |
| PUT | `/api/interns/{id}` | Administrateur |
| DELETE | `/api/interns/{id}` | Administrateur |
| GET | `/api/projects` | Tous |
| POST | `/api/projects` | Administrateur |
| GET | `/api/tasks` | Tous |
| POST | `/api/tasks` | Encadreur |
| GET | `/api/tasks/template` | Encadreur |
| POST | `/api/tasks/import` | Encadreur |
| GET | `/api/reports` | Tous |
| POST | `/api/reports` | Stagiaire |
| PATCH | `/api/reports/{id}/status` | Encadreur, Administrateur |
| GET | `/api/reports/{id}/pdf` | Tous |

---

## Import CSV en masse

### Procédure

1. Dans la section **Tâches**, cliquer sur **Modèle CSV** pour télécharger un fichier vierge.
2. Ouvrir le fichier avec un tableur (Excel, LibreOffice Calc, Google Sheets).
3. Remplir une ligne par tâche.

### Format du fichier

```csv
nom_tache;projet;stagiaire_email;statut;date_debut;date_fin
Développer la page d'accueil;Refonte du site web;jean@example.com;À faire;2026-10-01;2026-10-15
Corriger les bugs du menu;Refonte du site web;;En cours;2026-10-05;2026-10-20
```

### Spécifications des colonnes

| Colonne | Obligatoire | Format attendu |
|---------|-------------|----------------|
| `nom_tache` | Oui | Texte, 255 caractères maximum |
| `projet` | Oui | Nom exact du projet |
| `stagiaire_email` | Non | Adresse email d'un stagiaire membre du projet |
| `statut` | Oui | `À faire`, `En cours` ou `Terminé` |
| `date_debut` | Non | `YYYY-MM-DD`, `YYYY/MM/DD` ou `DD/MM/YYYY` |
| `date_fin` | Non | Identique à `date_debut` |

### Formats de date acceptés

- `2026-10-01`
- `2026/10/01`
- `01/10/2026`
- `1/10/2026`

### Importation

1. Cliquer sur **Importer**.
2. Sélectionner le fichier `.csv` (séparateur point-virgule).
3. Un récapitulatif s'affiche avec le nombre de tâches créées et la liste des erreurs éventuelles.

---

## Déploiement

### Backend

Configuration recommandée en production :

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.votre-domaine.com

DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=stagio
DB_USERNAME=...
DB_PASSWORD=...

MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxx
```

Commandes de déploiement :

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### Frontend

```bash
npm run build
```

Le contenu du dossier `dist/` doit être déployé sur un hébergeur statique.

### Hébergeurs recommandés

| Composant | Hébergeurs |
|-----------|------------|
| Backend Laravel | Railway, Render, Laravel Forge, VPS |
| Frontend React | Vercel, Netlify, Cloudflare Pages |
| Base de données | PlanetScale, Railway, Supabase |
| Service d'emails | Resend, Mailgun, SendGrid |

---

## Dépannage

### Erreur 403 Forbidden sur une route

La permission requise n'est pas attribuée au rôle. Vérification via Tinker :

```php
$role = Spatie\Permission\Models\Role::findByName('Encadreur');
$role->permissions->pluck('name');
```

### Erreur 422 lors de l'import CSV

- Vérifier l'extension du fichier (`.csv`, non `.xlsx`)
- Vérifier le séparateur (point-virgule)
- Vérifier l'encodage (UTF-8)

### La directive `upload_tmp_dir` est vide

Modifier le fichier `php.ini` :

```ini
upload_tmp_dir = "chemin/vers/backend/storage/tmp"
```

Puis redémarrer le service PHP.

### Les emails ne sont pas reçus

- Vérifier la variable `MAIL_PASSWORD` (16 caractères, sans espaces)
- Confirmer l'activation de la validation en deux étapes Google
- Consulter le dossier des courriers indésirables
- Tester l'envoi via `Mail::raw()` dans Tinker

### Erreur CORS

Vérifier le fichier `backend/config/cors.php` :

```php
'allowed_origins' => ['http://localhost:5173'],
'exposed_headers' => ['Content-Disposition', 'Content-Type'],
```

---

## Contribution

Les contributions sont les bienvenues. Pour proposer une amélioration :

1. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
2. Effectuer les modifications
3. Valider les changements (`git commit -m 'Ajout de la nouvelle fonctionnalité'`)
4. Pousser la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request


---

## Auteurs

**Lucie**
**Calixte TAKARA**
- Email : calixtetakara5@gmail.com
**Antoine-Marie NABEDE**
- Email : nabedeantoinemarie@gmail.com
---

## Remerciements

Ce projet s'appuie sur les technologies et bibliothèques suivantes :

- [Laravel](https://laravel.com) — Framework backend
- [React](https://react.dev) — Bibliothèque frontend
- [Tailwind CSS](https://tailwindcss.com) — Framework CSS
- [Lucide](https://lucide.dev) — Bibliothèque d'icônes
- [Spatie](https://spatie.be) — Gestion des rôles et permissions

---

**Stagio** — Gestion des stages simplifiée
