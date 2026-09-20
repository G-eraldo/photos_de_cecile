# Diagnostic d’indexation, page d’accueil

Date de contrôle : 16 septembre 2026.

Objectif : comprendre l’alerte Search Console « Page en double : Google n’a pas choisi la même URL canonique que l’utilisateur » pour `https://lesphotosdececile.fr/`.

## Périmètre et méthode

P1 est la page d’accueil `https://lesphotosdececile.fr/`.

Méthode : réponses HTTP publiques et HTML reçu le 16 septembre 2026, puis lecture de `robots.txt` et du sitemap public. Le compte Search Console n’a pas été consulté : l’URL canonique retenue par Google reste donc non vérifiée.

## Ce qui est observé

- P1 répond `200`, avec `X-Robots-Tag: index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
- Le HTML de P1 publie `<link rel="canonical" href="https://lesphotosdececile.fr/">` et `<meta property="og:url" content="https://lesphotosdececile.fr/">`.
- `http://lesphotosdececile.fr/` redirige en `301` vers `https://lesphotosdececile.fr/`.
- `https://www.lesphotosdececile.fr/` redirige en `301` vers `https://lesphotosdececile.fr/`.
- `robots.txt` est accessible et déclare `Sitemap: https://lesphotosdececile.fr/sitemap.xml`.
- Le sitemap public contient `https://lesphotosdececile.fr/`, sans variante `http` ou `www` observée.

## Lecture par famille

- Bases techniques : observé. Les signaux publics de canonisation de l’accueil sont cohérents.
- SEO de page : observé. Titre déclaré : « Photographe à Amiens » ; description publiée présente.
- Utilité : non évaluée, hors diagnostic de canonisation.
- Liens internes : non évalué, hors diagnostic de canonisation.
- Clarté SEO/GEO : observé partiellement dans le titre et la description, sans analyse éditoriale complète.
- Fiabilité : à confirmer dans Search Console, seule source permettant de connaître l’URL finalement retenue par Google.

## Action prioritaire

1. Ouvrir l’inspection de l’URL dans Search Console et relever les deux champs « URL canonique déclarée par l’utilisateur » et « URL canonique sélectionnée par Google ».

   Preuve : l’alerte fournie ne montre que la catégorie de problème et l’URL affectée, pas l’URL concurrente choisie par Google.

   Correction selon le résultat :

   - si Google sélectionne `http://` ou `www`, vérifier que les redirections `301` restent actives, puis demander une nouvelle exploration de `https://lesphotosdececile.fr/` ;
   - si Google sélectionne une ancienne adresse de déploiement ou une URL avec paramètre, rechercher cette adresse dans les liens externes, profils sociaux et anciennes configurations, la rediriger en `301` vers l’accueil si elle est encore contrôlée, puis demander une nouvelle exploration ;
   - si Google sélectionne déjà `https://lesphotosdececile.fr/`, l’alerte est vraisemblablement obsolète. Demander « Valider la correction » dans le rapport et laisser Google réexplorer.

   Effort : faible. Dépendance : accès au détail de l’inspection Search Console.

   Vérification : après validation, l’inspection doit indiquer la même URL canonique déclarée et sélectionnée.

## Limite importante

Une balise canonical est un signal, pas une instruction absolue. Le contrôle public prouve que les signaux actuels sont cohérents, mais ne permet pas d’affirmer quelle URL Google a sélectionnée ni de dater la prochaine réexploration. Référence : [documentation Google sur la consolidation des URL dupliquées](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
