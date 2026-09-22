# Abricot

Abricot est une interface web de gestion de projets et de tâches. L'application permet aux utilisateurs de créer un compte, de gérer leurs projets et de suivre les tâches qui leur sont assignées.

Le frontend est développé avec [Next.js](https://nextjs.org), [React](https://react.dev) et [TypeScript](https://www.typescriptlang.org). Il communique avec une API backend lancée localement sur `http://localhost:8000`.

## Fonctionnalités

- Inscription et connexion des utilisateurs
- Authentification par token conservé dans un cookie
- Tableau de bord avec recherche de tâches
- Affichage des tâches en liste ou en vue Kanban
- Création et suivi de projets
- Consultation du détail d'un projet et de son équipe
- Création, modification et suppression de projets
- Création et modification de tâches
- Attribution de tâches à des membres du projet
- Ajout de commentaires sur les tâches
- Modification des informations du profil et du mot de passe
- Interface responsive en français

## Pages principales

| Route | Description |
| --- | --- |
| `/login` | Connexion à l'application |
| `/register` | Création d'un compte |
| `/dashboard` | Tableau de bord et tâches assignées |
| `/projects` | Liste des projets accessibles |
| `/projects/[id]` | Détail d'un projet, tâches et commentaires |
| `/profile` | Consultation et modification du profil |

La route `/` redirige automatiquement vers `/dashboard` si un token est trouvé, sinon vers `/login`.

## Prérequis

- Node.js 20 ou version ultérieure recommandée
- npm
- Le backend Abricot démarré et accessible sur `http://localhost:8000`

Le frontend utilise notamment les endpoints suivants du backend :

- `/auth/login`, `/auth/register`, `/auth/profile` et `/auth/password`
- `/dashboard/assigned-tasks`
- `/projects` et `/projects/:id`
- `/projects/:id/tasks` et `/projects/:id/tasks/:taskId/comments`

## Installation

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev       # démarre Next.js en mode développement
npm run build     # génère le build de production
npm run start     # démarre le build de production
npm run lint      # lance ESLint
npm run format    # formate les fichiers du projet
```

## Technologies

- Next.js `16.3.3` avec App Router
- React `19.2.8`
- TypeScript
- Tailwind CSS `4`
- ESLint et Prettier
- `js-cookie` pour la gestion des cookies d'authentification

## Production

Construire puis démarrer l'application :

```bash
npm run build
npm run start
```

En production, le backend doit rester accessible depuis le navigateur à l'adresse utilisée par les appels API du frontend.
