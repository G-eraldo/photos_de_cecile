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

## Revue

- `npm run build` passe dans `photos_de_cecile`.
- `npm run build` passe dans `backEnd` ; Strapi affiche un avertissement sans bloquer la construction car le sandbox empêche l'écriture de ses préférences locales.
- Le serveur Nuxt démarre correctement hors sandbox sur le port 3000.
- Correction de routage : le catalogue est placé dans `tirages-photo/index.vue` pour ne pas masquer la fiche `[slug]`.
- Les pages tirages utilisent désormais la palette de l'accueil et une navigation brun foncé sur fond clair.
- La fiche produit place le configurateur dans une carte et conserve l'image visible au défilement sur grand écran.
- Le sélecteur de réservation affiche uniquement les formules (`Formule`) liées à la prestation choisie dans l’URL et transmet le choix à l’API.
- `npm run build` passe dans `photos_de_cecile` après cette correction.
