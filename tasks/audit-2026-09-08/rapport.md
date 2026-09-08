# Audit sécurité, SEO et préparation production — 8 septembre 2026

## Avis de lancement

**Pas encore de feu vert pour le site complet avec ventes et réservations, même en excluant le mode test Mollie.** Les principaux risques concernent l’encaissement sans créneau garanti, la reprise des paiements, les demandes de contact perdues et les paniers expirés. Une vitrine seule serait envisageable après correction du contact, des informations légales et du retrait du consentement, avec les parcours transactionnels désactivés.

Audit du frontend Nuxt 4 et du backend Strapi 5.52.2, du code actuel et de réponses HTTP publiques du domaine `photodececile.lafabriqueducode.fr`. Aucun paiement, e-mail, upload réel ou changement de configuration effectué. Aucun secret .env lu. Les chemins du rapport partent de `photos_de_cecile/`, sauf préfixe `../backEnd/`.

P1 = à traiter avant ouverture commerciale ; P2 = correction importante ; P3 = amélioration. Un défaut de code n’est pas une preuve d’exploitation. Les points dépendant de l’hébergement sont distingués des constats confirmés.

## 1. Blocages fonctionnels et sécurité métier

| Priorité | Constat et conséquence | Preuve | Action recommandée |
|---|---|---|---|
| P1 | Le paiement d’un acompte est créé sans vérifier que le créneau est libre et proposé. Deux clientes peuvent payer le même créneau. Le conflit n’est détecté qu’après encaissement. | `server/api/payments/mollie/create.post.js:48`, `server/api/calendar/reservations.post.js:111` | Réserver le créneau atomiquement en base avant paiement, avec expiration ; prévoir le traitement des conflits et remboursements. |
| P1 | La finalisation n’est pas protégée contre deux instances concurrentes : écriture puis relecture du numéro de tentative ne constituent pas un verrou atomique. Risque de doubles effets externes. | `server/utils/mollie-paid-payment.js:70` | Prise de verrou transactionnelle et opérations idempotentes. Tester deux webhooks simultanés et webhook + retour client. |
| P1 | Une panne après création Calendar, avant sauvegarde finale, peut bloquer la reprise : l’événement déjà créé est considéré comme une réservation concurrente. | `server/api/calendar/reservations.post.js:118`, `:137`, `:160` ; `server/utils/mollie-paid-payment.js:104` | Enregistrer/reconnaître un identifiant Calendar associé à la réservation et reprendre chaque étape séparément. |
| P1 | Le montant dépend de l’ID de formule CMS mais le forfait porté au contrat vient du texte client. Une formule moins chère peut être associée à un libellé plus cher. | `server/utils/mollie.js:74`, `server/api/payments/mollie/create.post.js:56`, `:71` | Utiliser les noms et données commerciales canoniques du CMS, sans propager librement les détails client. |
| P1 | Contact annonce un succès même si Resend renvoie un refus ; le frontend efface ensuite la demande. | `server/api/contact.post.js:61`, `app/components/FormContent.vue:40` | Contrôler le champ `error` renvoyé par Resend et conserver la saisie en cas d’échec. **Reproduit localement avec un fournisseur simulé.** |
| P1 | Le jeton d’une photo de panier expire après 15 minutes ; le panier peut rester affiché mais son paiement échoue. | `server/utils/r2-private.js:74`, `:98`, `server/api/payments/mollie/order.post.js:31` | Séparer la durée de la présignature et la référence durable de photo ou permettre une récupération explicite. **Reproduit localement après 16 minutes simulées.** |

## 2. Durcissement de sécurité

- **P2 — Upload R2 :** la signature PUT lie le type déclaré et l’hôte, mais pas la taille ni un hash du contenu (`server/utils/r2-private.js:81`). La vérification après stockage ne protège pas des fichiers abandonnés. Prévoir contrôle de transfert, quotas et suppression des uploads orphelins. La limite déclarative par défaut atteint 1 Gio. L’impact exact dépend des protections R2 externes. L’absence de contrainte de taille dans la signature a été vérifiée localement.
- **P2 — Limitation des requêtes :** compteurs en mémoire par processus, sans purge des anciennes IP (`server/utils/request-security.js:1`). Redémarrages et instances multiplient les quotas. `X-Forwarded-For` doit être assaini par le proxy ; son contournement n’a pas été testé. Utiliser une limite partagée ou celle de la plateforme.
- **P2 conditionnel — Droits des administrateurs :** la route de téléchargement des photos privées contrôle seulement l’authentification admin (`../backEnd/src/index.js:19`). Ajouter le droit de lecture des commandes si plusieurs rôles sont utilisés.
- **P3 — CSP :** politique présente, mais `script-src 'unsafe-inline'` réduit sa protection contre les injections. Un durcissement par nonce doit être testé avec Nuxt et les widgets, sans casser le rendu.

### Dépendances vérifiées le 8 septembre

`npm audit --omit=dev --json` : **frontend 0 paquet signalé ; backend 28 paquets affectés, dont 4 élevés, 20 modérés et 4 faibles ; aucun critique**. Ce ne sont pas 28 failles indépendantes : npm compte aussi les dépendants.

La chaîne `strapi-provider-email-resend@1.0.4 → resend@0.11.1 → axios@0.27.2` est réellement installée et porte plusieurs alertes. Vite 5.4.21 contribue également aux alertes élevées ; plusieurs scénarios concernent le serveur de développement ou Windows et ne démontrent pas une exploitation du backend de production. Mettre à niveau/remplacer le fournisseur ancien et trier les dépendances avec compatibilité Strapi 5. **Ne pas appliquer aveuglément `npm audit fix --force` : npm propose notamment un retour à Strapi 4.** Les résultats JSON sont conservés dans ce dossier.

## 3. SEO observé sur le domaine public

| Priorité | Constat | Correction |
|---|---|---|
| P2 | Le sitemap public contient les anciennes fiches `/tirages-photo/...`. Le code local génère désormais `/tirage-photo/...` (`server/api/__sitemap__/urls.get.js:22`). La fiche ancienne testée renvoie bien 301 vers la nouvelle. | Déployer la version alignée et vérifier/invalider le cache sitemap. L’écart code/public est prouvé ; sa cause exacte ne l’est pas. |
| P2 | Le sitemap inclut `/connexion-agenda`, `/offrir/confirmation`, `/tirage-photo/confirmation` et `/tirage-photo/panier`. Agenda et confirmation cadeau portent bien une meta noindex ; panier reste indexable. | Exclure toutes ces pages du sitemap et mettre le panier en noindex ; harmoniser la règle obsolète de `nuxt.config.ts:53`. |
| P2 | L’accueil public ne contient aucun H1. `app/components/accueil/Accueil.vue:38` démarre en H2. | Ajouter un titre principal visible et descriptif, par exemple « Photographe à Amiens ». Ce défaut ne signifie pas que Google ne peut pas indexer la page. |
| P2 | Titres publics dupliqués : « Portfolio \| Les Photos de Cécile \| Les photos de Cécile » et équivalent catalogue. | Retirer la marque des titres individuels puisque `app/app.vue:6` l’ajoute déjà. |
| P2 | Les photos au-delà du premier lot portfolio ne sont accessibles que par bouton JavaScript (`app/pages/portfolio.vue:149`). | Prévoir des URLs paginées explorables si l’objectif est de référencer toutes les images. |
| P3 | Textes de partage social génériques sur plusieurs pages ; données structurées locales sommaires et absence de Product/Offer sur les fiches. | Harmoniser titres/descriptions OG et enrichir les schémas avec les seules informations commerciales exactes. |
| P3 | Source sitemap limitée à 100 produits (`server/api/__sitemap__/urls.get.js:15`). | Paginer au-delà de 100 références ; aucun impact immédiat avec les deux fiches observées. |

Le domaine canonique est actuellement le sous-domaine de La fabrique du code. S’il ne s’agit pas du domaine définitif, aligner `site.url`, `SITE_URL`, les retours Mollie et OAuth, CORS, redirections 301 et Search Console lors de la bascule. Ne pas traiter un changement de domaine comme un simple changement DNS.

Google précise que robots.txt n’est pas un mécanisme de confidentialité ou une garantie de désindexation : [documentation robots](https://developers.google.com/search/docs/crawling-indexing/robots/intro). Pour les contenus chargés par clic, voir [chargement différé et exploration](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading).

## 4. Confidentialité et cohérence commerciale

- **P2 à régler avant lancement — Retrait du consentement absent :** le bandeau disparaît après acceptation/refus et aucun contrôle permanent ne permet de revenir sur le choix (`app/components/CookieBanner.vue:8`, `app/composables/useReviewsConsent.js`). Ajouter « Gérer mes cookies » et arrêter effectivement le widget lors du retrait. La [CNIL](https://www.cnil.fr/fr/cnil-direct/question/cookies-est-il-possible-de-finalement-refuser-les-cookies-dun-site-web-apres) demande un retrait simple et accessible à tout moment.
- **Informations légales à clarifier :** `app/pages/mentions-legales.vue:36` présente La fabrique du code comme éditeur et lui attribue l’autorisation de reproduction des photos ; les CGV et la confidentialité présentent Cécile comme professionnelle et responsable du traitement. Confirmer les rôles réels et les droits sur les photographies ; distinguer prestataire technique, vendeur et éditeur.
- **CGV à compléter avant ventes :** la page présente surtout un contrat de séance, sans coordonnées de médiateur trouvées. Elle annonce aussi un acompte à régler sous sept jours après réception du contrat (`app/pages/conditions-de-vente.vue:569`), alors que le parcours encaisse avant envoi du contrat. Clarifier les conditions des tirages, bons cadeaux, livraison, réclamations et rétractation selon les offres. Les coordonnées du médiateur doivent être communiquées selon le [ministère de l’Économie](https://www.economie.gouv.fr/mediation-conso/vous-etes-un-professionnel/vos-principales-obligations-0). Les exceptions de rétractation dépendent de la prestation : pas de conclusion juridique globale sur ce seul audit.
- **Conservation :** la politique annonce une conservation limitée des photos, mais aucune purge automatisée n’a été identifiée dans le code audité. Vérifier les règles R2, les archives, les sauvegardes et la procédure de suppression. Une politique écrite ne prouve pas son application technique.

## 5. Accessibilité, UX et performance

| Priorité | Constat | Preuve / action |
|---|---|---|
| P2 | Un ancien lien de confirmation d’une commande payée vide aussi un nouveau panier. | `app/pages/tirage-photo/confirmation.vue:34` : retirer seulement les articles de la commande correspondante, une fois. |
| P2 | Horaires calculés dans le fuseau du navigateur puis interprétés en Europe/Paris par le serveur. | `app/components/ReservationForm.vue:44`, `:87` : imposer Europe/Paris pour dates et heures ; tester un navigateur dans un autre fuseau. |
| P2, risque non reproduit en navigateur | Panier persisté par défaut en cookie ; articles avec métadonnées et jetons peuvent dépasser sa capacité. | `app/stores/useCartStore.js:34` et module Pinia installé : choisir explicitement le stockage, vérifier un panier multi-articles après rechargement. |
| P2 | Texte `#9e8b8b` sur blanc : contraste calculé à environ 3,22:1, trop faible pour le texte courant visé à 4,5:1. | `app/components/FormContent.vue:62` : assombrir les labels et messages. Pas de certification WCAG globale. |
| P2 | Champs contact obligatoires côté serveur mais validation navigateur incomplète. | `app/components/FormContent.vue:70` : required, limites, erreurs associées aux champs. |
| P2 | Centre de carte et marqueur distants d’environ 23 km ; icône cdnjs absente de la liste CSP des images. | `app/components/propos/Maps.vue:14`, `:22`, `:27` : corriger coordonnées et héberger l’icône sur une origine autorisée. |
| P3 | Icône panier desktop sans nom accessible. | `app/components/Navbar.vue:99` : ajouter un aria-label. |
| P2/P3 | Bannières servies directement sans srcset/sizes. | `app/components/EditorialPhotoBanner.vue:11` : variantes adaptées mobile ; mesurer poids et LCP. Les dimensions HTML ne réduisent pas les octets transférés. |

Le HTML brut observé du portfolio fait environ 323 ko (avant compression), contre environ 48 ko pour l’accueil. Ce n’est ni une mesure du poids total de page ni un score Core Web Vitals. Aucun Lighthouse ni audit visuel mobile/clavier complet effectué : LCP, INP, CLS et poids réel des images restent à mesurer.

## 6. Exploitation à valider avant feu vert

- Sauvegarde PostgreSQL **et essai de restauration**, sauvegarde/rétention des médias privés, procédure de retour arrière.
- Surveillance HTTP, erreurs API, échecs de finalisation payée et e-mails refusés ; mécanisme de reprise indépendant de la visite du client.
- Variables de production contrôlées dans l’hébergeur. `.env.example` backend omet notamment DATABASE_CLIENT, DATABASE_URL et les paramètres R2/Resend utilisés ; la base par défaut est SQLite si DATABASE_CLIENT manque (`../backEnd/config/database.js:7`). Le frontend duplique RESEND_FROM_EMAIL et documente une valeur de test. Cela ne prouve pas une mauvaise configuration déployée.
- Version Node de déploiement compatible : le frontend exige >=24.11, alors que le shell d’audit utilise 22.23.2. Aucun build de référence réexécuté dans ce runtime non conforme ; le serveur public répond néanmoins.
- Permissions des rôles Strapi, portée des tokens, comptes administrateurs, proxy de confiance et CORS R2 : configuration effective à vérifier. Les trois GET anonymes contrôlés sont refusés ; les droits d’écriture/authentifiés n’ont pas été testés.
- Tests automatisés des flux critiques : aucun script test dans les deux package.json. Scénarios requis : refus e-mail, créneau déjà pris, concurrence, webhook dupliqué, interruption après Calendar, panier ancien et reprise d’upload.
- Vérification commerciale de bout en bout dans Mollie test : réservation, bon cadeau, tirage ; retours annulé/échoué/payé, facture et contrat, réception e-mails et planning. Aucun de ces parcours n’a été exécuté sur les services externes pendant l’audit.

## Vérifications réalisées et points positifs

- HTTPS accueil 200, CSP/HSTS/nosniff/anti-iframe présents.
- Robots 200 autorisant l’exploration ; sitemap 200 ; canonicals sur le domaine actuel.
- Portfolio, catalogue, panier, agenda et confirmation cadeau : 200 ; URL inexistante : vraie 404.
- API calendrier et portfolio : 200 (cela ne valide pas la justesse des données).
- Ancienne fiche tirage testée : 301 ; nouvelle fiche : 200.
- Strapi anonyme : commandes 403, réservations 403, upload/files 403 ; aucun contenu personnel affiché.
- Webhook revérifie le paiement auprès de Mollie ; prix de tirages recalculés serveur ; ancien endpoint direct de réservation désactivé ; photos privées signées ; OAuth protégé ; échappement HTML des e-mails.
- Avis conditionnés initialement au consentement ; images portfolio avec dimensions et lazy loading ; langue française déclarée.
- Trois reproductions isolées réussies : faux succès contact, expiration photo de panier et absence de taille signée. Script `reproduce.mjs`, sans requêtes métier et avec fausses valeurs de configuration.

## Ordre de traitement proposé

1. Créneaux/encaissement, données canoniques des formules et finalisation idempotente.
2. Contact, durée de vie des photos de panier et nettoyage/persistance du panier.
3. Dépendances backend, quotas/uploads, retrait du consentement et informations commerciales.
4. Alignement du déploiement SEO, sitemap, H1 et titres.
5. Recette mobile/clavier, mesures performance, test des sauvegardes et parcours Mollie test avant ouverture réelle.

Les seuls fichiers ajoutés/modifiés pour cet audit sont le rapport, ses preuves et le suivi de tâches. Aucun correctif applicatif ni déploiement n’a été réalisé.
