# E-Commerce Platform

Une plateforme e-commerce complète construite avec Next.js et Supabase.

##  Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (Base de données, Authentification, Storage)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Gestion d'état**: React Query (TanStack Query)
- **Email**: Resend API

##  Fonctionnalités

### Client
- **Catalogue produits**: Navigation, recherche, filtrage par catégorie
- **Panier**: Ajout/Modification/Suppression de produits
- **Commande**: Formulaire de commande complet avec validation
- **Contact**: Formulaire de contact avec envoi d'emails
- **Paiement**: Intégration des statuts de paiement

### Administration
- **Gestion des produits**: CRUD complet avec upload d'images
- **Gestion des catégories**: Création dynamique des catégories
- **Gestion des commandes**: Suivi des statuts (en préparation, livrée)
- **Réclamations**: Consultation des messages clients
- **Paramètres du site**: Configuration des informations générales


## 🛠️ Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd ecommerce-ui-generation
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

## 🗃️ Base de données

Le projet utilise Supabase avec les tables principales :
- `produit`: Informations des produits
- `commande`: Commandes clients
- `reclamations`: Messages de contact
- `categories`: Catégories de produits

## 📝 Notes importantes

- **Statuts des commandes**: Limités à `en_preparation` et `livree`
- **Authentification**: Basée sur les métadonnées utilisateur Supabase
- **Images**: Upload via Supabase Storage
- **Rate limiting**: Implémenté sur les routes API sensibles

## 🚀 Déploiement

```bash
# Build pour production
npm run build

# Démarrer en production
npm start
```

## 📄 Licence
Projet privé - Tous droits réservés
