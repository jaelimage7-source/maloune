# 🛍️ Maloune.com — Boutique Dropshipping

Boutique en ligne custom avec CJ Dropshipping, Stripe, PayPal, et support multilingue (Français, Kreyòl, English).

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript |
| Style | Tailwind CSS |
| Base de données | PostgreSQL (Neon - gratuit) |
| ORM | Prisma |
| Paiement | Stripe + PayPal |
| Dropshipping | CJ Dropshipping API V2.0 |
| Email | Resend |
| Tracking | AfterShip API |
| i18n | next-intl (fr, ht, en) |
| Hébergement | Vercel (gratuit) |
| Domaine | maloune.com (LWS) |

---

## 🚀 Guide de Démarrage — Étape par Étape

### Étape 1 : Créer les comptes (gratuits)

#### 1.1 — Neon PostgreSQL (Base de données)
1. Aller sur https://neon.tech
2. Créer un compte gratuit
3. Créer un nouveau projet "maloune"
4. Copier l'URL de connexion (DATABASE_URL)

#### 1.2 — Vercel (Hébergement)
1. Aller sur https://vercel.com
2. Créer un compte gratuit avec GitHub
3. On déploiera le projet plus tard

#### 1.3 — Stripe (Paiement carte)
1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte
3. En mode Test, copier les clés API (pk_test_... et sk_test_...)

#### 1.4 — Resend (Email)
1. Aller sur https://resend.com
2. Créer un compte gratuit
3. Copier la clé API

### Étape 2 : Installer le projet en local

```bash
# Cloner ou copier le projet
cd maloune

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos clés
nano .env
```

### Étape 3 : Configurer la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schema vers Neon
npx prisma db push

# (Optionnel) Voir la DB dans le navigateur
npx prisma studio
```

### Étape 4 : Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

### Étape 5 : Déployer sur Vercel

```bash
# 1. Pousser le code sur GitHub
git init
git add .
git commit -m "Initial commit - Maloune shop"
git remote add origin https://github.com/VOTRE-USER/maloune.git
git push -u origin main

# 2. Sur Vercel :
#    - Importer le repo GitHub
#    - Ajouter les variables d'environnement (.env)
#    - Déployer
```

### Étape 6 : Pointer le domaine maloune.com

#### Dans Vercel :
1. Settings → Domains → Ajouter `maloune.com`
2. Vercel va vous donner les enregistrements DNS à configurer

#### Dans LWS (Panneau DNS) :
Ajouter ces enregistrements :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

⚠️ La propagation DNS peut prendre jusqu'à 24-48h.

---

## 📁 Structure du Projet

```
maloune/
├── prisma/
│   ├── schema.prisma          # Schema Prisma (ORM)
│   └── schema.sql             # Schema SQL brut
├── public/
│   └── images/                # Images statiques
├── src/
│   ├── app/
│   │   ├── [locale]/          # Pages avec i18n
│   │   │   ├── layout.tsx     # Layout principal
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Pages produits
│   │   │   ├── cart/          # Panier
│   │   │   ├── checkout/      # Paiement
│   │   │   └── account/       # Compte client
│   │   └── api/               # Routes API
│   │       ├── auth/          # Authentification
│   │       ├── products/      # API Produits
│   │       ├── cart/          # API Panier
│   │       ├── orders/        # API Commandes
│   │       ├── payments/      # Stripe/PayPal webhooks
│   │       ├── cj/            # Sync CJ Dropshipping
│   │       └── webhooks/      # Webhooks entrants
│   ├── components/
│   │   ├── ui/                # Composants réutilisables
│   │   ├── layout/            # Header, Footer, Nav
│   │   ├── products/          # Cartes produit, galerie
│   │   ├── cart/              # Composants panier
│   │   └── checkout/          # Formulaires checkout
│   ├── i18n/
│   │   ├── messages/
│   │   │   ├── fr.json        # Traductions Français
│   │   │   ├── ht.json        # Traductions Kreyòl
│   │   │   └── en.json        # Traductions English
│   │   ├── routing.ts         # Config routes i18n
│   │   └── request.ts         # Config serveur i18n
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── cj-client.ts       # Client API CJ Dropshipping
│   │   └── utils.ts           # Fonctions utilitaires
│   ├── styles/
│   │   └── globals.css        # Styles globaux + Tailwind
│   └── middleware.ts           # Middleware i18n
├── .env.example                # Template variables env
├── next.config.js              # Config Next.js
├── tailwind.config.js          # Config Tailwind
├── tsconfig.json               # Config TypeScript
└── package.json
```

---

## 🔗 URLs du Projet

| Service | URL |
|---------|-----|
| **Site** | https://maloune.com |
| **Site (FR)** | https://maloune.com/fr |
| **Site (HT)** | https://maloune.com/ht |
| **Site (EN)** | https://maloune.com/en |
| **CJ Dashboard** | https://cjdropshipping.com |
| **CJ API Docs** | https://developers.cjdropshipping.cn/en/api/api2/ |
| **Stripe Dashboard** | https://dashboard.stripe.com |
| **Neon Dashboard** | https://console.neon.tech |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## 📋 Prochaines Étapes de Développement

- [ ] Créer les composants UI (Header, Footer, ProductCard)
- [ ] Construire la page d'accueil
- [ ] Construire la page catalogue produits
- [ ] Construire la page détail produit
- [ ] Implémenter le panier (Zustand store)
- [ ] Construire le checkout (Stripe Elements)
- [ ] Intégrer PayPal
- [ ] Sync automatique produits CJ
- [ ] Sync automatique commandes CJ
- [ ] Emails transactionnels (Resend)
- [ ] Tracking livraison (AfterShip)
- [ ] Dashboard admin
- [ ] SEO (sitemap, meta tags, structured data)
