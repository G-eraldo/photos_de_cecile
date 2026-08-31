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
