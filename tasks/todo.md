# Tirages photo

## Remplacement du logo — Les Photos de Cécile

- [ ] Auditer les usages du logo sur le site, les e-mails, les PDF et Strapi.
- [ ] Préparer des déclinaisons nettes du logo fourni (site, e-mail, favicon et administration).
- [ ] Remplacer le logo sur le site et son favicon.
- [ ] Ajouter le logo aux factures et aux contrats PDF, puis mettre à jour les e-mails envoyés.
- [ ] Remplacer le logo et le favicon de l’administration Strapi.
- [ ] Vérifier les builds, les PDF générés et consigner la revue.

## Correctif panier et aperçu des photos privées

- [x] Réduire le panier de navigation à une icône visible également sur mobile.
- [x] Adapter l’aperçu Strapi aux photos privées enregistrées sous forme de liste.
- [x] Compiler Nuxt et Strapi, puis consigner la revue.

## Correctif disposition de la navigation desktop

- [x] Conserver le logo, les liens et l’icône panier sur une même ligne en desktop.
- [x] Préserver strictement le rendu mobile existant.
- [x] Compiler Nuxt et vérifier le diff.

## Panier de tirages

- [x] Installer et configurer Pinia pour le panier persistant.
- [x] Remplacer le formulaire de fiche produit par l’ajout au panier avec photo privée.
- [x] Créer la page panier et le paiement groupé des tirages.
- [x] Afficher le panier dans la navigation seulement lorsqu’il contient un article.
- [x] Vérifier les compilations et consigner la revue.

## Tarification des tirages

- [x] Ajouter les tarifs par format et les suppléments configurables à la collection Produit.
- [x] Recalculer le prix de la fiche tirage selon le format, les bords frangés et l’envoi postal.
- [x] Valider le même calcul côté serveur avant le paiement Mollie.
- [x] Compiler les applications et consigner la revue.

## Cohérence éditoriale du site

- [x] Auditer les titres et en-têtes des pages par rapport à Portfolio.
- [x] Créer une présentation éditoriale réutilisable (sur-titre, titre, texte et séparateurs).
- [x] Appliquer cette présentation aux pages publiques, sans modifier leur contenu métier.
- [x] Vérifier le rendu responsive et compiler Nuxt.

## Fiche tirage — en-tête éditorial

- [x] Adapter la fiche dynamique `/tirages-photo/[slug]` au bandeau de la boutique.
- [x] Vérifier la compilation Nuxt.

## Correctifs accueil et réservation mobile

- [x] Renforcer le contraste du titre « Découvrez les formules ».
- [x] Corriger le retour à la ligne de l’acceptation des conditions sur mobile.
- [x] Vérifier la compilation Nuxt.

## Bon cadeau

- [x] Remplacer la page `/offrir` par le configurateur de bon cadeau statique.
- [x] Créer le paiement Mollie sécurisé et enregistrer le bon cadeau dans Strapi.
- [x] Adapter les confirmations e-mail et le retour de paiement au bon cadeau.
- [x] Compiler Nuxt et Strapi, puis consigner la revue.

## Bon cadeau - prestations et PDF personnalisé

- [x] Ajouter les trois modèles de bons cadeaux et sélectionner le bon modèle selon le forfait.
- [x] Refaire le configurateur avec prestation, forfait, bénéficiaire et message.
- [x] Valider les prix par prestation côté serveur et enregistrer les informations du bon.
- [x] Générer le PDF personnalisé et le joindre à l'e-mail client après paiement.
- [x] Générer un bon d'exemple, contrôler son rendu et compiler Nuxt.

## Bon cadeau - aperçu

- [x] Remplacer l'image d'aperçu de la page par l'URL de la photo fournie.
- [x] Vérifier la compilation Nuxt.

## Correctif bon cadeau - défilement

- [x] Réserver l'espace de l'image distante et différer son décodage.
- [x] Vérifier la compilation Nuxt.

## Correctif bon cadeau - défilement unifié

- [x] Retirer le positionnement fixe de l’aperçu afin que les deux colonnes défilent ensemble.
- [x] Vérifier la compilation Nuxt.

## Correctif bon cadeau - comportement photo

- [x] Reprendre exactement le comportement sticky de la fiche `/tirages-photo/[slug]` pour l’aperçu.
- [x] Vérifier la compilation Nuxt.

## Bon cadeau - envoi par courrier

- [x] Ne joindre le PDF du bon cadeau qu’en cas d’envoi par e-mail.
- [x] Adapter les messages de confirmation et de la page au traitement par courrier par Cécile.
- [x] Vérifier la compilation Nuxt.

## Correctif bon cadeau — confirmation et notification

- [x] Corriger le routage de la confirmation après Mollie.
- [x] Rétablir et reprendre la notification Cécile sans renvoyer l’e-mail cliente.
- [x] Compiler Nuxt et vérifier le parcours de reprise.

## Incident — portfolio indisponible

- [x] Reproduire l’échec de récupération des médias via Strapi et identifier la cause.
- [ ] Redémarrer/redéployer le service Strapi dans l’hébergeur (bloqué : accès à la console d’hébergement requis).
- [x] Vérifier le démarrage local de Strapi et l’accès à PostgreSQL.

## Correctif — images du portfolio bloquées

- [x] Identifier la CSP comme origine du blocage des images Cloudflare.
- [x] Autoriser les deux domaines Cloudflare du portfolio dans `img-src`.
- [x] Compiler le frontend.
- [ ] Redéployer le frontend.


## Conformité, notifications et référencement

- [x] Envoyer une notification à Cécile après le paiement d'une commande ou d'une réservation.
- [x] Ajouter les mentions légales et la politique de confidentialité adaptées au site.
- [x] Auditer les cookies et traceurs réellement présents.
- [x] Corriger l'URL canonique Nuxt SEO dans le fichier de configuration protégé après accord.
- [x] Compléter les métadonnées SEO des pages et exclure les retours de paiement des moteurs.
- [x] Auditer la sécurité applicative et consigner les priorités.

## Audit de préparation au domaine public

- [x] Vérifier les contrôles de sécurité, les secrets et les flux tiers.
- [x] Vérifier les signaux SEO effectivement servis sur le domaine public.
- [x] Évaluer les prérequis de déploiement hors Mollie production.

## Commande de tirages photo

- [x] Auditer le flux de paiement existant et définir le parcours commande.
- [x] Ajouter la collection Strapi `commande` avec les coordonnées, les détails et la photo source.
- [x] Ajouter la création de commande, l'upload sécurisé et le paiement Mollie.
- [x] Envoyer automatiquement la facture au paiement confirmé.
- [x] Ajouter le formulaire de commande sur les fiches tirage et l'écran de confirmation.
- [x] Compiler les deux applications et consigner la revue.

## Commande de tirages — dépôt privé R2 direct

- [x] Vérifier le bucket privé et le flux actuel de téléversement.
- [x] Générer une URL R2 signée et vérifier le fichier privé avant la commande.
- [x] Envoyer directement la photo du navigateur au bucket privé.
- [x] Enregistrer les métadonnées privées dans la commande, sans URL publique.
- [ ] Appliquer le CORS du bucket privé dans Cloudflare.
- [x] Documenter le CORS, vérifier les compilations et le parcours de signature.

- [x] Examiner l'existant et la direction visuelle de référence.
- [x] Ajouter la collection Strapi `produit`.
- [x] Refaire le catalogue `/tirages-photo`.
- [x] Créer la fiche produit dynamique `/tirages-photo/[slug]`.
- [x] Compiler les deux applications et consigner la revue.

## Réservation — choix de formule

- [x] Identifier la structure des formules et la prestation sélectionnée.
- [x] Relier le sélecteur aux formules de la prestation choisie.
- [x] Vérifier la compilation de la page de réservation.
- [x] Mettre à jour l’API pour valider et enregistrer la formule.
- [x] Vérifier la compilation après la mise à jour de l’API.

## Paiement d’acompte Mollie

- [x] Définir le flux sécurisé de paiement et de confirmation par webhook.
- [x] Créer la collection Strapi `reservation`.
- [x] Créer le paiement Mollie et rediriger la cliente vers le checkout.
- [x] Confirmer une réservation après paiement, puis créer l’événement et envoyer l’e-mail.
- [x] Ajouter la page de retour de paiement et les variables de déploiement requises.
- [x] Vérifier les deux applications.

## Paiement d’acompte — frais kilométriques

- [x] Afficher l’acompte total, frais kilométriques inclus, dans le bouton de réservation.
- [x] Calculer et enregistrer les frais kilométriques côté serveur avant la création du paiement Mollie.
- [x] Vérifier la compilation Nuxt.

## Réservation — créneaux d’une heure

- [x] Centraliser la durée et proposer uniquement des créneaux d’une heure.
- [x] Créer la réservation Google et l’e-mail de confirmation avec la même durée.
- [x] Vérifier la compilation Nuxt.

- Revue du 5 septembre 2026 : une disponibilité Google de deux heures est découpée en deux choix consécutifs d’une heure, tandis qu’une disponibilité d’exactement une heure est proposée telle quelle. La validation serveur, l’événement Google créé et les horaires de confirmation utilisent tous la durée partagée d’une heure. `npm run build` et `git diff --check` passent.

## Paiement Mollie — retour de confirmation

- [x] Corriger le routage de `/reservation/confirmation`.
- [x] Vérifier que la page de confirmation est incluse dans le build Nuxt.
- [ ] Renseigner les variables serveur de paiement sur le déploiement public et redéployer.

## Paiement Mollie — confirmation cliente et agenda

- [x] Rediriger automatiquement la cliente vers l’accueil après confirmation.
- [x] Indiquer dans Google Calendar que l’acompte est payé.
- [x] Vérifier la compilation Nuxt.

## Correctif réservation — fuseau horaire Dokploy

- [x] Interpréter les dates de réservation explicitement dans le fuseau Europe/Paris.
- [x] Vérifier les heures d’été et d’hiver, puis compiler Nuxt.
- [x] Reprendre automatiquement une finalisation payée restée bloquée en cours.

## Connexion Google Agenda de Cécile

- [x] Ajouter un assistant interne protégé pour autoriser le compte Google de Cécile et récupérer un refresh token sans le persister.
- [x] Documenter les variables de déploiement et vérifier la compilation Nuxt.

## Correction — nouvelle formule non réservable

- [x] Identifier l’origine du refus de la formule dans l’API de paiement.
- [x] Rendre la recherche de formule compatible avec les relations Strapi v5.
- [x] Vérifier la compilation Nuxt et consigner la revue.

## Portfolio — album photo

- [x] Examiner les médias et définir une mosaïque unique, sans catégories.
- [x] Charger les photos du dossier Portfolio de Strapi avec leurs liens Cloudflare.
- [x] Créer la page portfolio responsive, accessible et optimisée.
- [x] Vérifier la compilation et le rendu de la page.

## Portfolio — diffusion optimisée par Cloudflare

- [x] Valider que le Worker et son domaine `images-photodececile` répondent avec une image transformée.
- [x] Générer les URLs de vignettes optimisées côté serveur sans exposer de configuration sensible.
- [x] Utiliser des tailles adaptées dans la mosaïque tout en conservant le lien vers l’original.
- [x] Documenter la variable de déploiement et vérifier la compilation Nuxt.

## Portfolio — chargement adaptatif

- [x] Fournir des sources responsives selon la largeur réellement affichée.
- [x] Conserver une qualité adaptée à la présentation photo et limiter le premier lot à 12 images.

## Portfolio — album unique et sélection éditoriale

- [x] Retirer l’intertitre qui sépare visuellement l’album sans toucher à la disposition des photos.
- [x] Permettre de choisir et d’ordonner les six premières photos depuis la médiathèque Strapi.
- [x] Vérifier la compilation et documenter la méthode de sélection.

## Portfolio — sélection des 18 images d’ouverture

- [x] Choisir 2 images par dossier, sauf 4 animaux et 0 baptême.
- [x] Alterner les thèmes dans l’ordre des 18 premières images.
- [x] Enregistrer les marqueurs de sélection dans Strapi après validation finale.

## Portfolio — grille de l’album

- [x] Répartir automatiquement les photos selon leur format pour équilibrer les trois colonnes de l’album.
- [x] Ajouter deux images au premier lot pour combler les colonnes les plus courtes.
- [x] Ajuster les sources responsive à la nouvelle largeur des vignettes.
- [x] Vérifier la compilation Nuxt.

## Animations d’apparition au défilement

- [x] Mettre en place un mécanisme global d’apparition progressive, compatible mobile et desktop.
- [x] Respecter les préférences d’accessibilité et préserver l’affichage sans JavaScript.
- [x] Vérifier la compilation Nuxt et consigner la revue.

## Accueil — relais Instagram

- [x] Ajouter le bloc Instagram et les trois photos fournies avant les avis.
- [x] Adapter la présentation à tous les écrans et lier l’ensemble au compte Instagram de Cécile.
- [x] Optimiser les images et vérifier la compilation Nuxt.

## Bandeaux photos des pages éditoriales

- [x] Ajouter un bandeau photo unique sur les pages À propos, Prestations et Contact.
- [x] Optimiser les photos sélectionnées pour leur affichage grand format.
- [x] Vérifier la compilation Nuxt et consigner la revue.

## Revue

- Bandeaux photos des pages éditoriales du 5 septembre 2026 : À propos, Prestations et Contact reçoivent chacun un visuel large sous leur bandeau de titre, avec des cadrages adaptés au sujet. Les trois images source sont converties en JPEG de 1 800 px et pèsent ensemble moins de 1 Mo. `npm run build` et `git diff --check` passent.

- Accueil — relais Instagram du 5 septembre 2026 : un encart blanc, responsive et entièrement cliquable est placé avant les avis. Il présente `@lesphotosdececile80` et les trois photos fournies ; celles-ci sont réduites à 900 px de large et représentent au total moins de 500 Ko. `npm run build` et `git diff --check` passent.

- Animations d’apparition au défilement du 5 septembre 2026 : un observer global révèle les sections et en-têtes à l’approche du viewport, y compris pour les contenus chargés après l’affichage initial. Le hero est exclu afin de rester immédiatement visible. L’arrivée est renforcée (48 px et léger zoom, sur 900 ms) tout en restant douce. Les contenus restent visibles sans JavaScript et l’animation est neutralisée lorsque la préférence système de réduction des animations est active. `npm run build` et `git diff --check` passent.

- Correctif navigation desktop du 5 septembre 2026 : la barre dispose d’une largeur maximale de 112rem et les éléments desktop ne peuvent plus revenir à la ligne ; les espacements deviennent plus compacts sur les écrans desktop intermédiaires. Le panier reste une icône, tandis que le rendu mobile est inchangé. `npm run build` et `git diff --check` passent.

- Correctif panier et photo privée du 5 septembre 2026 : le panier est une icône seule, affichée auprès du menu burger sur mobile et dans la navigation desktop lorsqu’il contient un tirage. L’outil d’administration Strapi prend désormais en charge le tableau `photo_privee` créé pour les commandes groupées et ouvre correctement la première photo de la commande. `npm run build` passe dans Nuxt et Strapi, et `git diff --check` passe.

- Panier de tirages du 5 septembre 2026 : Pinia conserve les tirages et leur référence de photo privée. La fiche produit téléverse la photo puis ajoute le tirage configuré au panier ; les coordonnées et l’adresse sont demandées une seule fois dans `/tirages-photo/panier`. Les tirages sont exclusivement expédiés par courrier, facturé une seule fois par commande. L’API vérifie de nouveau chaque produit, format, option et photo avant Mollie, et finalise toutes les photos après paiement. Le lien Panier disparaît lorsqu’il est vide et le panier est vidé après confirmation. `npm run build` et `git diff --check` passent.

- Tarification des tirages du 5 septembre 2026 : la collection Produit dispose désormais de `tarifs_formats`, `supplement_bords_franges` (1 € par défaut) et `supplement_courrier` (5 € par défaut). La fiche affiche le prix du format choisi, ajoute le bord frangé, puis ajoute l’envoi postal une seule fois au total. L’API recalcule et valide ces montants depuis Strapi avant Mollie ; la facture distingue aussi le supplément d’envoi. `npm run build` passe dans Nuxt et Strapi, et `git diff --check` passe.

- Correctifs accueil et réservation mobile du 5 septembre 2026 : le titre « Découvrez les formules » est clair sur le fond sombre. Sur le formulaire mobile, la case d’acceptation ne rétrécit plus et son libellé s’écoule naturellement à côté, sans espacement artificiel entre chaque fragment. `npm run build` et `git diff --check` passent.

- Fiche tirage du 5 septembre 2026 : toutes les URLs produit `/tirages-photo/[slug]` utilisent maintenant le bandeau éditorial dynamique de la boutique. Le titre et l’accroche sont issus du produit, tandis que la photo, le prix, les caractéristiques et le configurateur restent dans leur disposition existante. `npm run build` et `git diff --check` passent.

- Cohérence éditoriale du 5 septembre 2026 : le bandeau de Portfolio est maintenant un composant partagé, avec le même sur-titre Poppins, titre Playfair, palette et doubles séparateurs. Il structure Portfolio, Prestations, À propos, Contact, Réservation, Bon cadeau, Tirages et les pages d’information ; les formulaires reprennent une hiérarchie interne plus sobre. `npm run build` passe.

- Envoi par courrier du 4 septembre 2026 : un bon cadeau choisi par courrier ne génère ni ne joint de PDF au message cliente ; seule la facture acquittée reste jointe. La page et l’e-mail indiquent que Cécile prépare puis expédie le bon à l’adresse fournie. `npm run build` passe dans Nuxt.

- Comportement photo bon cadeau du 4 septembre 2026 : l’aperçu utilise désormais la même structure (`sticky`, position et ratio) que la fiche `/tirages-photo/[slug]`, en gardant l’URL directe de l’image. `npm run build` passe dans Nuxt.

- Correctif défilement unifié du 4 septembre 2026 : l’aperçu du bon cadeau ne reste plus fixe sur desktop ; la photo complète et le formulaire défilent maintenant ensemble. `npm run build` passe dans Nuxt.

- Correctif défilement bon cadeau du 4 septembre 2026 : l’aperçu distant réserve désormais sa zone avec son ratio réel et utilise un décodage asynchrone. Le chargement de la photo n’entraîne plus de recalcul de mise en page pendant le défilement. `npm run build` passe dans Nuxt.

- Aperçu bon cadeau du 4 septembre 2026 : l’image affichée sur `/offrir` est désormais directement chargée depuis l’URL de la photo fournie. Les modèles PDF restent inchangés. `npm run build` passe dans Nuxt.

- Correctif notification Cécile du 4 septembre 2026 : les commandes confirmaient l'e-mail cliente mais la notification interne restait à `false`, signe d'un refus Resend ou d'un destinataire configuré incorrectement. La boîte professionnelle `lesphotosdececile80@gmail.com` est désormais systématiquement destinataire ; une adresse configurée valide est ajoutée seulement en copie. Lorsqu'une commande déjà payée a `notificationCecileEnvoyee: false`, la page de confirmation la retente sans dupliquer l'e-mail cliente. `npm run build` passe dans Nuxt.

- Correctif e-mail bon cadeau du 4 septembre 2026 : une emoji dans le message personnalisé provoquait une erreur d'encodage de la police PDF avant l'appel Resend ; aucun e-mail ne pouvait donc être envoyé. Le texte dessiné dans le PDF est maintenant nettoyé des caractères non pris en charge, tandis que le message stocké est conservé. La génération du PDF est exécutée dans le périmètre d'échec de l'e-mail cliente : une erreur future n'empêche plus la notification Cécile. Le PDF a été généré avec le message contenant `👌` et `npm run build` passe dans Nuxt.

- Bon cadeau personnalisé du 4 septembre 2026 : les bons 5, 10 et 15 photos fournis sont intégrés et utilisés comme modèle PDF. Le formulaire choisit la prestation puis ne propose que les forfaits compatibles : Animaux (5/10/15 : 110/185/230 €), famille/couple/grossesse/portrait/boudoir (10/15 : 185/230 €) et naissance (10/15 : 250/295 €). Après paiement, le bon joint à l'e-mail remplit le bénéficiaire, l'offreur, le message et une validité d'un an. Le prix est recalculé et contrôlé côté serveur. Le PDF exemple a été rendu et inspecté visuellement ; `npm run build` passe dans Nuxt.

- Correctif bon cadeau du 4 septembre 2026 : la page de confirmation était masquée par le fichier `pages/offrir.vue`. La page principale est maintenant `pages/offrir/index.vue`, donc `/offrir/confirmation` résout bien vers son écran dédié. La notification Cécile utilise désormais la variable actuelle, son ancien nom `CECILE_NOTIFICATION_EMAIL` ou l’adresse métier en dernier repli. Lorsqu’une notification interne seule a échoué, la page de confirmation la relance sans renvoyer l’e-mail cliente. `npm run build` passe dans Nuxt.

- Bon cadeau du 4 septembre 2026 : `/offrir` propose les choix 5/10/15 photos, la réception par e-mail ou courrier (+5 €) et le forfait naissance (+65 €, uniquement pour 10 ou 15 photos). Le montant est recalculé et validé côté serveur avant Mollie ; la commande est enregistrée dans la collection Strapi `commande`, sans produit Strapi. Après paiement confirmé, le webhook existant envoie les confirmations cliente et Cécile, adaptées au bon cadeau, sans tenter de traiter une photo privée. Une confirmation dédiée est disponible sur `/offrir/confirmation`. `npm run build` passe dans Nuxt et Strapi (l'avertissement de préférences Strapi du sandbox reste sans effet sur le build).

- [x] Réservation payée : ne plus masquer une erreur de finalisation derrière « réservation introuvable », permettre une reprise sûre de Calendar et vérifier le build.
- [x] Bloquer la création d’un paiement de réservation si le jeton Google ou le droit d’écriture Calendar n’est pas valide.
- [x] Autoriser l’iframe Elfsight après consentement et initialiser le widget sans chargement différé.
- [x] Monter explicitement le script et le bloc Elfsight après consentement, selon le parcours SPA du fournisseur.
- [x] Autoriser le sous-domaine Elfsight CDN chargé par le widget dans la CSP.

- Correctif réservation payée du 4 septembre 2026 : une erreur de finalisation Calendar/e-mail ne fait plus répondre l’endpoint de statut en 500, donc la page ne prétend plus que la réservation est introuvable. L’état de reprise est retourné à la page et, après déploiement, une réservation payée en erreur est retentée à intervalle mesuré depuis sa page de confirmation. Les journaux serveur enregistrent désormais la cause technique exacte (référence, paiement, message et code) sans exposer ces informations à la cliente. `npm run build` passe dans Nuxt.

- Diagnostic Calendar du 4 septembre 2026 : Google renvoie `invalid_grant` car `GOOGLE_REFRESH_TOKEN` est expiré ou révoqué. Le jeton doit être régénéré avec un compte ayant le droit d’écriture sur le calendrier, puis remplacé dans Dokploy et redéployé. Une vérification d’accès est maintenant effectuée avant de créer un paiement Mollie de réservation ; `npm run build` passe dans Nuxt.

- Correctif du contrôle Calendar du 4 septembre 2026 : le parcours OAuth demande volontairement le scope limité `calendar.events`. La vérification préventive utilise donc maintenant `events.list`, compatible avec ce scope, au lieu de `calendars.get` qui provoquait à tort un 403. Aucune écriture de test n’est effectuée.

- Consentement avis du 4 septembre 2026 : le consentement Elfsight est demandé dans un bandeau global à la première arrivée. Après acceptation, les avis se chargent automatiquement à leur emplacement ; le bloc de consentement au milieu de la section avis est supprimé. Le refus évite toujours le chargement du service tiers. `npm run build` passe dans Nuxt.

- Audit final vérifié en ligne le 4 septembre 2026 : le frontend sert CSP, HSTS, anti-iframe, `nosniff`, politique de référent et permissions policy ; la CSP autorise précisément Strapi et le compte R2. La CORS Strapi refuse `https://evil.example` et accepte le domaine frontend configuré ; les collections commande/réservation répondent 403 publiquement. L’image Open Graph/Twitter répond 200, `robots.txt` et le sitemap sont cohérents, et les écrans de paiement sont `noindex`. Le site est prêt pour ce domaine hors test Mollie final ; si un autre domaine devient le domaine public, mettre à jour `site.url`, `SITE_URL`, `FRONTEND_URL`, les redirections Google et les canoniques avant bascule.

- Correctif e-mails de réservation du 4 septembre 2026 : le SDK Resend renvoie ses refus dans le champ `error` sans forcément lever d’exception ; le flux les détecte maintenant et n’enregistre plus un faux succès. Les pièces jointes utilisent `contentType`, la propriété attendue par le SDK, et l’adresse de notification Cécile a un repli explicite. `npm run build` passe dans Nuxt.

- Correction des trois blocants d’audit du 4 septembre 2026 : la CSP autorise désormais exclusivement l’API Strapi configurée et le compte Cloudflare R2 configuré, ce qui rétablit l’upload direct de photo avant Mollie ; CORS Strapi accepte seulement `FRONTEND_URL`, une éventuelle préproduction explicite et localhost ; l’image Open Graph/Twitter/JSON-LD pointe vers une photo Cloudinary publique vérifiée en HTTP 200. `npm run build` passe pour Nuxt et Strapi.

- Audit de pré-déploiement du 4 septembre 2026 : le domaine HTTPS redirige correctement depuis HTTP ; `robots.txt`, sitemap, canonicals, métadonnées sociales et JSON-LD sont publiés, et les pages de confirmation ont bien `noindex`. Avant une ouverture au grand public, corriger la CORS Strapi qui réfléchit actuellement toute origine avec les credentials, ajouter l’origine Strapi à la CSP frontend si les requêtes CMS restent exécutées dans le navigateur, fournir une image Open Graph réellement accessible (`/profil.png` renvoie 404), et remplacer l’URL canonique/JSON-LD si le domaine final diffère de `photodececile.lafabriqueducode.fr`. Les limites anti-abus Nuxt sont seulement mémoire et le verrou Mollie n’est pas un compare-and-set distribué ; prévoir une solution persistante avant un volume significatif. Le contrôle `npm audit` n’a pas pu obtenir de réponse exploitable du registre npm dans cet environnement.

- Correctifs production du 4 septembre 2026 : le formulaire de contact renvoie un libellé de succès explicite ; l’API agenda ne divulgue plus les événements Google non liés aux séances et ne sert que les créneaux de deux heures réservables dans les 90 jours. Le webhook et la page de statut Mollie confirment désormais le paiement avant la finalisation Calendar/e-mail, ce qui évite une attente infinie après un paiement accepté ; un marqueur de finalisation et un verrou local empêchent les doublons dans une même instance et permettent une reprise en cas d’erreur. Les en-têtes CSP, HSTS, anti-iframe, `nosniff`, référent et permissions sont produits par Nuxt, et le serveur retire `X-Powered-By`. La route de photo R2 est maintenant enregistrée dans l’API Strapi d’administration authentifiée, pas dans les permissions Public. `npm run build` passe dans Nuxt et Strapi.

- Audit production du 4 septembre 2026 : le domaine répond en HTTPS, les pages principales, `robots.txt`, le sitemap, les balises canoniques et le produit dynamique sont publiés ; les écrans de confirmation sont exclus du sitemap. Le lancement public doit toutefois attendre au minimum la correction de la variable de notification Cécile (`RESEND_CECILE_NOTIFICATION_EMAIL` utilisée dans le code alors que l’exemple documente `CECILE_NOTIFICATION_EMAIL`) et l’ajout d’en-têtes de sécurité HTTP. Un rate-limit distribué et une protection anti-bot restent aussi nécessaires pour les routes générant des coûts.

- Les paiements Mollie confirmés envoient maintenant une notification distincte à Cécile pour les commandes de tirages et les réservations. `CECILE_NOTIFICATION_EMAIL` permet de remplacer l’adresse de réception ; à défaut, l’adresse professionnelle déjà publiée est utilisée. `RESEND_FROM_EMAIL` est aussi pris en compte.
- Les pages `/mentions-legales` et `/politique-confidentialite` sont ajoutées et reliées depuis le pied de page. Elles décrivent les données réellement utilisées par les formulaires, Mollie, Resend, Google Calendar, Cloudflare R2, MapTiler et le widget d’avis.
- Le widget Elfsight se charge automatiquement après consentement et lors des visites suivantes pendant six mois ; un refus est aussi mémorisé et peut être modifié. Le site ne dépose pas de cookie applicatif, d’audience ou publicitaire détecté dans le code hors ce choix de consentement.
- Nuxt SEO est déjà installé. Les métadonnées, données structurées, URL canonique, `robots.txt` et sitemap pointent vers le domaine de production. Les retours de paiement sont exclus du sitemap et les fiches produits Strapi y sont ajoutées dynamiquement.
- Sécurité : l’audit a relevé en priorité l’absence de limitation anti-abus sur les URL R2 signées, l’absence de validation binaire/antivirus des photos et l’interpolation non échappée dans les anciens e-mails de contact/réservation. `npm run build` passe après les modifications.

- Les photos de commande sont désormais envoyées par URL R2 signée vers `cecile-uploads-prives`, sans passer par Nuxt ou Strapi. La commande conserve uniquement leurs métadonnées privées ; aucune URL publique n’est créée. Le CORS et les nouvelles variables requises sont documentés dans `docs/r2-private-uploads.md`.
- La fiche de chaque tirage comporte désormais le formulaire de commande (nom, prénom, e-mail, adresse postale et photo) puis redirige vers Mollie. La commande est enregistrée dans Strapi avec l'instantané du produit, du prix, des options, de la quantité et la photo source ; le prix est relu côté serveur pour ne pas dépendre du navigateur.
- Le webhook Mollie traite maintenant les commandes et les réservations. Pour une commande payée, il génère une facture PDF et l'envoie à la cliente avec la confirmation. Deux écrans dédiés couvrent l'attente et le résultat du paiement de commande.
- `npm run build` passe dans `photos_de_cecile`. `npm run build` passe dans `backEnd` avec le seul avertissement Strapi existant lié au sandbox (`~/Library/Preferences/com.strapi/config.json`).
- `npm run build` passe dans `photos_de_cecile`.
- `npm run build` passe dans `backEnd` ; Strapi affiche un avertissement sans bloquer la construction car le sandbox empêche l'écriture de ses préférences locales.
- Le serveur Nuxt démarre correctement hors sandbox sur le port 3000.
- Correction de routage : le catalogue est placé dans `tirages-photo/index.vue` pour ne pas masquer la fiche `[slug]`.
- Les pages tirages utilisent désormais la palette de l'accueil et une navigation brun foncé sur fond clair.
- La fiche produit place le configurateur dans une carte et conserve l'image visible au défilement sur grand écran.
- Le sélecteur de réservation affiche uniquement les formules (`Formule`) liées à la prestation choisie dans l’URL et transmet le choix à l’API.
- `npm run build` passe dans `photos_de_cecile` après cette correction.
- `npm run build` passe dans `photos_de_cecile` et dans `backEnd` après l’ajout du paiement d’acompte Mollie et de la collection `reservation`.
- `npm run build` passe dans `photos_de_cecile` après ajout des frais kilométriques à l’acompte Mollie.
- `npm run build` passe après correction du routage `/reservation/confirmation` ; la page de confirmation est présente dans le bundle.
- L’API publique de statut retourne actuellement `503 Le paiement n’est pas encore configuré.` : les variables serveur du déploiement public sont incomplètes ou non appliquées, ce qui empêche aussi le webhook Mollie de confirmer cette réservation.
- `npm run build` passe après ajout de la redirection de confirmation et de la mention d’acompte payé dans Google Calendar.
- La réservation transmet maintenant les identifiants de la prestation et de la formule à l’API : la validation côté serveur ne dépend plus d’un libellé strict. `npm run build` passe et le calcul d’acompte d’une formule nouvellement ajoutée a été vérifié avec un test ciblé.
- Le portfolio charge les images de la médiathèque Strapi via une route serveur authentifiée, renvoie uniquement leurs URLs publiques Cloudflare et les affiche dans une mosaïque responsive. Chaque image ouvre le fichier original dans un nouvel onglet. `npm run build` passe.
- Correction du portfolio : l’endpoint Upload installé ne prend pas en charge les filtres de dossier et ignore la pagination. Une requête unique, sans paramètre, renvoie les médias et évite l’erreur 400 ainsi que les doublons.
- Les vignettes portfolio privilégient maintenant le format Strapi `large`, au lieu de `medium`, pour conserver une image nette dans la mosaïque tout en évitant le téléchargement immédiat des originaux.
- Refonte éditoriale du portfolio : les originaux Cloudflare sont désormais affichés avec chargement différé, accompagnés d’une composition d’ouverture dynamique et d’un album complet en colonnes.
- Performance du portfolio : la page charge une seule image en priorité et affiche le reste de l’album par lots de 18 à la demande, afin de préserver la qualité originale sans ralentir le premier affichage.
- Le portfolio mélange maintenant les médias dans un ordre stable afin d’éviter les blocs de photos similaires, notamment plusieurs images noir et blanc à la suite.
- Le portfolio utilise désormais le Worker Cloudflare pour des formats de 1 600 px dans la sélection et 1 200 px dans l’album ; le clic conserve l’accès à l’original. La variable serveur `PORTFOLIO_IMAGE_ORIGIN` configure le domaine du Worker. `npm run build` passe.
- Le portfolio sélectionne maintenant automatiquement une variante de 480, 800, 1 200 ou 1 600 px selon la taille réellement affichée et l’écran. La qualité du Worker reste à 88, et le premier lot de l’album est limité à 12 images.
- L’intertitre intermédiaire du portfolio a été supprimé pour former un seul album continu. Les six photos d’ouverture peuvent être choisies et ordonnées dans la légende Strapi avec les marqueurs `#portfolio-une-1` à `#portfolio-une-6`. `npm run build` passe.
- Les 18 premières images sont désormais choisies dans Strapi et ordonnées par les marqueurs `#portfolio-une-1` à `#portfolio-une-18` : 4 animaux, 2 images de chacun des sept autres thèmes retenus et aucune image de baptême. Toutes proviennent exclusivement des sous-dossiers du dossier Portfolio ; l’ordre alterne les thèmes.
- L’album répartit désormais automatiquement les photos selon leur format afin d’équilibrer les trois colonnes sans recadrage et sans large zone vide. Les `srcset` sont ajustés au tiers de largeur ; `npm run build` passe.
- Le premier lot de l’album contient désormais 20 images (26 avec la mosaïque d’ouverture) ; les deux nouvelles images sont placées dans les colonnes les plus courtes. Les lots suivants restent de 12 images.
