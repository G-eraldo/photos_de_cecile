# Connexion de l’agenda de Cécile

La page interne `/connexion-agenda` permet de générer un `GOOGLE_REFRESH_TOKEN` pour le compte Google de Cécile. Elle ne stocke pas ce token : il est placé dans un cookie HTTP-only temporaire, affiché une seule fois, puis supprimé.

## Variables de production

Configurer ces variables sur l’hébergeur Nuxt :

```text
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://DOMAINE_DU_SITE/api/google-calendar/setup/callback
GOOGLE_REFRESH_TOKEN=
GOOGLE_OAUTH_SETUP_SECRET=
```

`GOOGLE_OAUTH_SETUP_SECRET` doit être une valeur aléatoire longue, réservée à l’administrateur du site. Par exemple :

```sh
openssl rand -base64 32
```

Ne pas l’enregistrer dans Git, ni transmettre cette valeur, le Client Secret ou le refresh token dans un message.

Dans Google Cloud Console, ajouter **exactement** la valeur de `GOOGLE_REDIRECT_URI` dans les URI de redirection autorisés du client OAuth existant.

## Récupérer le token

1. Déployer les variables, puis ouvrir `https://DOMAINE_DU_SITE/connexion-agenda`.
2. Entrer `GOOGLE_OAUTH_SETUP_SECRET`.
3. Se connecter au compte Google de Cécile et accepter l’accès à Google Agenda.
4. Copier le token affiché dans `GOOGLE_REFRESH_TOKEN` sur l’hébergeur.
5. Redéployer puis réaliser une réservation de test.

Pour l’identifiant de calendrier, Cécile le trouve dans Google Agenda : **Paramètres** → agenda concerné → **Intégrer l’agenda** → **ID de l’agenda**. Garder la clé API existante dans `GOOGLE_CALENDAR_API_KEY` : elle sert à lire les disponibilités. Le refresh token sert à créer l’événement après paiement.

Si Google ne renvoie pas de refresh token, retirer l’accès de l’application depuis le compte Google de Cécile, puis recommencer l’autorisation : Google ne le renvoie généralement qu’à la première autorisation.
