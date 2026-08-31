# Tirages photo

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

## Paiement Mollie — retour de confirmation

- [x] Corriger le routage de `/reservation/confirmation`.
- [x] Vérifier que la page de confirmation est incluse dans le build Nuxt.
- [ ] Renseigner les variables serveur de paiement sur le déploiement public et redéployer.

## Paiement Mollie — confirmation cliente et agenda

- [x] Rediriger automatiquement la cliente vers l’accueil après confirmation.
- [x] Indiquer dans Google Calendar que l’acompte est payé.
- [x] Vérifier la compilation Nuxt.

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

## Revue

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
