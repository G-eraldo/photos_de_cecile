# Photos privées et durée du panier

L’URL PUT autorise un transfert pendant 15 minutes. La référence signée de photo reste utilisable **7 jours** ; le panier permet de remplacer une photo expirée. La présignature lie désormais `content-length`, `content-type` et `host`. Le navigateur calcule lui-même Content-Length depuis le File/Blob : ne pas ajouter cet en-tête interdit en JavaScript. Le serveur vérifie à nouveau taille exacte, type et signature du fichier avant paiement.

`ORDER_UPLOAD_MAX_BYTES` : 50 Mio par défaut, au maximum 100 Mio. La limite individuelle (12 signatures / 10 minutes) est complétée par une limite globale (100 / heure), atomiques dans Redis en production. Ces quotas bornent le volume autorisé mais ne remplacent pas la surveillance des coûts R2.

## Configuration Cloudflare à appliquer avant déploiement

- Bucket privé, sans domaine public ni URL r2.dev active.
- CORS : origine `https://lesphotodececile.fr`, méthode `PUT`, en-tête `Content-Type`. Ajouter seulement les origines de recette réellement utilisées. La signature de taille doit être vérifiée sur un upload test navigateur : taille exacte acceptée, taille différente refusée.
- Lifecycle : supprimer `commandes/pending/` après **8 jours**, et non l’ancienne règle de 2 jours ; ne jamais appliquer cette règle à `commandes/payees/`.
- Après paiement, la photo est copiée sous `commandes/payees/<reference>/` puis le temporaire est supprimé. Les abandons sont nettoyés par le lifecycle. Pour les photos payées, prévoir une purge après exécution/réclamation suivant la politique de conservation choisie par Cécile ; pas de suppression aveugle des commandes en cours.
- Tester qu’un accès anonyme au bucket est refusé ; contrôler les droits des clés R2 et les sauvegardes.

Ces paramètres Cloudflare ne sont pas modifiés par le code Nuxt et n’ont pas été appliqués automatiquement.
