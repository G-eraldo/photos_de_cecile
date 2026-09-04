# Fichiers privés de commandes

Les fichiers sont d’abord déposés sous `commandes/pending/`. Après paiement Mollie validé, le webhook les déplace sous `commandes/payees/`. Les paiements annulés, expirés ou échoués suppriment leur fichier temporaire.

Dans Cloudflare R2, ajouter une règle Lifecycle sur le préfixe `commandes/pending/` qui supprime les objets après **2 jours**. Elle nettoie ainsi les envois interrompus ou les téléversements qui ne mènent jamais à un paiement, sans supprimer les photos des commandes payées.

`ORDER_UPLOAD_MAX_BYTES` définit le plafond métier de l’upload. Par défaut, il est de 1 Gio ; il peut être augmenté jusqu’à la limite technique R2 de 5 Gio pour un PUT simple.
