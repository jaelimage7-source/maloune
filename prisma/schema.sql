-- ============================================================
-- SCHEMA BASE DE DONNÉES — BOUTIQUE DROPSHIPPING
-- Compatible avec CJ Dropshipping API V2.0
-- Stack: PostgreSQL + Node.js + Next.js
-- Auteur: Pierre-Louis | Février 2026
-- ============================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================
-- 1. TYPES ENUM
-- ============================================================

CREATE TYPE order_status AS ENUM (
    'PENDING',          -- Commande créée, en attente de paiement
    'PAID',             -- Paiement confirmé
    'PROCESSING',       -- Envoyée à CJ Dropshipping
    'CREATED',          -- Créée chez CJ (orderStatus CJ: CREATED)
    'IN_CART',          -- Dans le panier CJ
    'UNPAID',           -- Non payée chez CJ
    'UNSHIPPED',        -- Payée mais pas encore expédiée
    'SHIPPED',          -- Expédiée (trackNumber disponible)
    'DELIVERED',        -- Livrée
    'CANCELLED',        -- Annulée
    'REFUNDED',         -- Remboursée
    'DISPUTE'           -- En litige
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'SUCCEEDED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);

CREATE TYPE payment_provider AS ENUM (
    'STRIPE',
    'PAYPAL'
);

CREATE TYPE locale_code AS ENUM (
    'fr',   -- Français
    'ht',   -- Kreyòl Ayisyen
    'en'    -- English
);

CREATE TYPE currency_code AS ENUM (
    'EUR',
    'USD',
    'GBP',
    'HTG'
);

-- ============================================================
-- 2. CATÉGORIES PRODUITS (sync avec CJ API getCategory)
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cj_category_id VARCHAR(200) UNIQUE,         -- categoryId de CJ API
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    level SMALLINT NOT NULL DEFAULT 1,           -- 1, 2, ou 3 (hiérarchie CJ)
    slug VARCHAR(200) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE category_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    locale locale_code NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    UNIQUE(category_id, locale)
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_cj_id ON categories(cj_category_id);
CREATE INDEX idx_cat_trans_locale ON category_translations(category_id, locale);

-- ============================================================
-- 3. PRODUITS (sync avec CJ API Product List V2)
-- ============================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identifiants CJ Dropshipping
    cj_product_id VARCHAR(200) UNIQUE,           -- id CJ (ex: "04A22450-67F0-...")
    cj_sku VARCHAR(100),                         -- SKU CJ (ex: "CJNSSYWY01847")
    cj_spu VARCHAR(100),                         -- SPU CJ
    
    -- Catégorie
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Prix
    cj_sell_price DECIMAL(18, 2),                -- Prix fournisseur CJ (sellPrice)
    cj_now_price DECIMAL(18, 2),                 -- Prix actuel CJ (nowPrice/discountPrice)
    sell_price DECIMAL(18, 2) NOT NULL,          -- Notre prix de vente
    compare_at_price DECIMAL(18, 2),             -- Prix barré (ancien prix)
    cost_price DECIMAL(18, 2),                   -- Coût réel (CJ + shipping)
    currency currency_code DEFAULT 'EUR',
    
    -- Médias
    main_image_url TEXT,                         -- bigImage CJ
    images JSONB DEFAULT '[]',                   -- Array d'URLs images
    video_urls JSONB DEFAULT '[]',               -- Vidéos produit
    
    -- Inventaire CJ
    cj_warehouse_inventory INT DEFAULT 0,        -- warehouseInventoryNum
    cj_verified_inventory INT DEFAULT 0,         -- totalVerifiedInventory
    cj_delivery_cycle VARCHAR(20),               -- deliveryCycle (ex: "3-5")
    
    -- Métadonnées
    slug VARCHAR(300) NOT NULL UNIQUE,
    weight_grams INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_free_shipping BOOLEAN DEFAULT FALSE,      -- addMarkStatus CJ
    product_type VARCHAR(50),                    -- productType CJ
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    
    -- Sync
    cj_last_synced_at TIMESTAMPTZ,
    cj_raw_data JSONB,                           -- Données brutes CJ (backup)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    locale locale_code NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    UNIQUE(product_id, locale)
);

CREATE INDEX idx_products_cj_id ON products(cj_product_id);
CREATE INDEX idx_products_sku ON products(cj_sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_prod_trans_locale ON product_translations(product_id, locale);

-- ============================================================
-- 4. VARIANTES PRODUIT (sync avec CJ Variant API)
-- ============================================================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Identifiants CJ
    cj_variant_id VARCHAR(200) UNIQUE,           -- vid CJ
    cj_variant_sku VARCHAR(100),
    
    -- Propriétés
    variant_name VARCHAR(300),                   -- Ex: "Red / XL"
    properties JSONB DEFAULT '{}',               -- {"color": "Red", "size": "XL"}
    variant_image_url TEXT,
    
    -- Prix
    cj_sell_price DECIMAL(18, 2),
    sell_price DECIMAL(18, 2) NOT NULL,
    compare_at_price DECIMAL(18, 2),
    
    -- Inventaire
    cj_inventory INT DEFAULT 0,
    inventory_quantity INT DEFAULT 0,            -- Notre stock local si besoin
    
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_cj_id ON product_variants(cj_variant_id);

-- ============================================================
-- 5. CLIENTS
-- ============================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentification
    email CITEXT NOT NULL UNIQUE,
    password_hash VARCHAR(255),                  -- bcrypt hash
    
    -- Profil
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    
    -- Préférences
    preferred_locale locale_code DEFAULT 'fr',
    preferred_currency currency_code DEFAULT 'EUR',
    
    -- Paiement externe
    stripe_customer_id VARCHAR(100) UNIQUE,
    paypal_payer_id VARCHAR(100),
    
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    
    -- Marketing
    accepts_marketing BOOLEAN DEFAULT FALSE,
    
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_stripe ON customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================================
-- 6. ADRESSES CLIENT
-- ============================================================

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Correspondance directe avec CJ API createOrderV2
    customer_name VARCHAR(200) NOT NULL,         -- shippingCustomerName
    phone VARCHAR(30),                           -- shippingPhone
    email VARCHAR(200),                          -- email
    
    address_line1 VARCHAR(500) NOT NULL,         -- shippingAddress
    address_line2 VARCHAR(500),                  -- shippingAddress2
    house_number VARCHAR(20),                    -- houseNumber
    city VARCHAR(100) NOT NULL,                  -- shippingCity
    county VARCHAR(100),                         -- shippingCounty
    province VARCHAR(100),                       -- shippingProvince
    postal_code VARCHAR(20),                     -- shippingZip
    country VARCHAR(100) NOT NULL,               -- shippingCountry
    country_code VARCHAR(5) NOT NULL,            -- shippingCountryCode (ex: "US", "FR")
    
    -- Tax
    tax_id VARCHAR(50),                          -- taxId (pour UE)
    
    is_default BOOLEAN DEFAULT FALSE,
    label VARCHAR(50),                           -- "Maison", "Bureau", etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);

-- ============================================================
-- 7. PANIER (Cart)
-- ============================================================

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(200),                     -- Pour visiteurs non connectés
    locale locale_code DEFAULT 'fr',
    currency currency_code DEFAULT 'EUR',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(18, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_carts_customer ON carts(customer_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================================
-- 8. COMMANDES
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Numéros de référence
    order_number VARCHAR(50) NOT NULL UNIQUE,     -- Notre numéro (ex: "ORD-20260226-001")
    cj_order_id VARCHAR(100),                     -- orderId CJ
    cj_order_num VARCHAR(100),                    -- orderNum CJ
    
    -- Client
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(200) NOT NULL,
    
    -- Adresse de livraison (snapshot au moment de la commande)
    shipping_customer_name VARCHAR(200) NOT NULL,
    shipping_phone VARCHAR(30),
    shipping_address VARCHAR(500) NOT NULL,
    shipping_address2 VARCHAR(500),
    shipping_house_number VARCHAR(20),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_county VARCHAR(100),
    shipping_province VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100) NOT NULL,
    shipping_country_code VARCHAR(5) NOT NULL,
    shipping_tax_id VARCHAR(50),
    
    -- Montants
    subtotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(18, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    currency currency_code DEFAULT 'EUR',
    
    -- CJ Montants
    cj_product_amount DECIMAL(18, 2),            -- productAmount CJ
    cj_postage_amount DECIMAL(18, 2),            -- postageAmount CJ
    cj_order_amount DECIMAL(18, 2),              -- orderAmount CJ
    
    -- Statut
    status order_status DEFAULT 'PENDING',
    cj_order_status VARCHAR(50),                 -- Statut brut CJ
    
    -- Logistique CJ
    cj_logistic_name VARCHAR(100),               -- logisticName (ex: "CJPacket Ordinary")
    cj_from_country_code VARCHAR(5),             -- fromCountryCode (ex: "CN")
    cj_storage_id VARCHAR(200),                  -- storageId (entrepôt CJ)
    cj_storage_name VARCHAR(200),                -- storageName
    
    -- Tracking
    tracking_number VARCHAR(200),                -- trackNumber CJ
    tracking_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- IOSS (pour livraisons EU)
    ioss_type VARCHAR(20),
    ioss_number VARCHAR(50),
    
    -- Notes
    customer_note TEXT,
    internal_note TEXT,
    remark VARCHAR(500),                         -- remark CJ
    
    -- Métadonnées
    locale locale_code DEFAULT 'fr',
    ip_address INET,
    user_agent TEXT,
    
    -- Sync CJ
    cj_synced_at TIMESTAMPTZ,
    cj_paid_at TIMESTAMPTZ,
    cj_raw_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    
    -- Identifiants CJ
    cj_variant_id VARCHAR(200),                  -- vid CJ
    cj_line_item_id VARCHAR(200),                -- lineItemId CJ
    store_line_item_id VARCHAR(200),             -- storeLineItemId CJ
    
    -- Snapshot produit (au moment de la commande)
    product_name VARCHAR(500) NOT NULL,
    variant_name VARCHAR(300),
    product_image_url TEXT,
    sku VARCHAR(100),
    
    -- Montants
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(18, 2) NOT NULL,          -- Notre prix de vente
    cj_sell_price DECIMAL(18, 2),                -- Prix CJ au moment de la commande
    total_price DECIMAL(18, 2) NOT NULL,
    
    -- Statut production CJ
    cj_production_status INT,                    -- productionOrderStatus
    cj_abnormal_types JSONB,                     -- abnormalType array
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_cj_id ON orders(cj_order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 9. PAIEMENTS (Stripe + PayPal)
-- ============================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Fournisseur de paiement
    provider payment_provider NOT NULL,
    
    -- Identifiants externes
    stripe_payment_intent_id VARCHAR(200),
    stripe_charge_id VARCHAR(200),
    paypal_order_id VARCHAR(200),
    paypal_capture_id VARCHAR(200),
    
    -- Montants
    amount DECIMAL(18, 2) NOT NULL,
    currency currency_code NOT NULL,
    fee_amount DECIMAL(18, 2),                   -- Frais Stripe/PayPal
    net_amount DECIMAL(18, 2),                   -- Montant net
    
    -- Statut
    status payment_status DEFAULT 'PENDING',
    
    -- Métadonnées
    provider_response JSONB,                     -- Réponse complète du fournisseur
    failure_reason VARCHAR(500),
    
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Identifiants externes
    stripe_refund_id VARCHAR(200),
    paypal_refund_id VARCHAR(200),
    
    amount DECIMAL(18, 2) NOT NULL,
    currency currency_code NOT NULL,
    reason TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDING',
    provider_response JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_paypal ON payments(paypal_order_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- ============================================================
-- 10. SUIVI DE LIVRAISON (AfterShip + CJ Tracking)
-- ============================================================

CREATE TABLE shipment_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Tracking
    tracking_number VARCHAR(200) NOT NULL,
    carrier_code VARCHAR(50),                    -- Code transporteur AfterShip
    carrier_name VARCHAR(100),                   -- Nom transporteur (logisticName CJ)
    tracking_url TEXT,
    
    -- Statut
    current_status VARCHAR(50),                  -- pending, in_transit, delivered, etc.
    status_detail TEXT,
    
    -- Dates
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    last_event_at TIMESTAMPTZ,
    
    -- Historique des événements
    events JSONB DEFAULT '[]',
    -- Format: [{"date": "...", "status": "...", "location": "...", "description": "..."}]
    
    -- AfterShip
    aftership_tracking_id VARCHAR(200),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_order ON shipment_tracking(order_id);
CREATE INDEX idx_tracking_number ON shipment_tracking(tracking_number);

-- ============================================================
-- 11. CODES PROMO / RÉDUCTIONS
-- ============================================================

CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    
    -- Type de réduction
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value DECIMAL(18, 2) NOT NULL,      -- Pourcentage ou montant fixe
    currency currency_code DEFAULT 'EUR',
    
    -- Conditions
    minimum_order_amount DECIMAL(18, 2),
    maximum_discount_amount DECIMAL(18, 2),
    
    -- Limites d'utilisation
    usage_limit INT,                             -- Nombre total d'utilisations
    usage_count INT DEFAULT 0,
    per_customer_limit INT DEFAULT 1,
    
    -- Validité
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    discount_amount DECIMAL(18, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discount_code ON discount_codes(code);
CREATE INDEX idx_discount_usage_code ON discount_usage(discount_code_id);
CREATE INDEX idx_discount_usage_customer ON discount_usage(customer_id);

-- ============================================================
-- 12. AVIS CLIENTS
-- ============================================================

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT,
    images JSONB DEFAULT '[]',
    
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    locale locale_code DEFAULT 'fr',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_approved ON product_reviews(is_approved) WHERE is_approved = TRUE;

-- ============================================================
-- 13. CONFIGURATION CJ DROPSHIPPING
-- ============================================================

CREATE TABLE cj_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- API Credentials
    api_email VARCHAR(200) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Paramètres sync
    default_from_country_code VARCHAR(5) DEFAULT 'CN',
    preferred_storage_id VARCHAR(200),
    preferred_logistic_name VARCHAR(100),
    
    -- Marges
    default_margin_percent DECIMAL(5, 2) DEFAULT 50.00,  -- 50% marge par défaut
    
    -- Webhook
    webhook_secret VARCHAR(200),
    
    -- Dernier sync
    last_product_sync_at TIMESTAMPTZ,
    last_order_sync_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. SESSIONS & TOKENS
-- ============================================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================================
-- 15. EMAILS TRANSACTIONNELS (log)
-- ============================================================

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    to_email VARCHAR(200) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template VARCHAR(100) NOT NULL,              -- "order_confirmation", "shipping_update", etc.
    locale locale_code DEFAULT 'fr',
    
    provider VARCHAR(50),                        -- "resend" ou "sendgrid"
    provider_message_id VARCHAR(200),
    
    status VARCHAR(20) DEFAULT 'SENT',           -- SENT, DELIVERED, BOUNCED, FAILED
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_customer ON email_logs(customer_id);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);

-- ============================================================
-- 16. PARAMÈTRES BOUTIQUE
-- ============================================================

CREATE TABLE store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description VARCHAR(500),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paramètres par défaut
INSERT INTO store_settings (key, value, description) VALUES
    ('store_name', '"Lounie Shop"', 'Nom de la boutique'),
    ('default_locale', '"fr"', 'Langue par défaut'),
    ('supported_locales', '["fr", "ht", "en"]', 'Langues supportées'),
    ('default_currency', '"EUR"', 'Devise par défaut'),
    ('supported_currencies', '["EUR", "USD"]', 'Devises supportées'),
    ('shipping_countries', '["FR", "US", "CA", "GP", "MQ", "GF", "RE", "HT"]', 'Pays de livraison'),
    ('free_shipping_threshold', '50.00', 'Seuil livraison gratuite (EUR)'),
    ('tax_rate', '0.20', 'Taux de TVA par défaut (20%)'),
    ('contact_email', '"malou509@yahoo.fr"', 'Email de contact'),
    ('social_links', '{"tiktok": "", "instagram": "", "facebook": ""}', 'Liens réseaux sociaux');

-- ============================================================
-- 17. FONCTIONS UTILITAIRES
-- ============================================================

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    date_part VARCHAR(8);
    seq_part VARCHAR(4);
    result VARCHAR(50);
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    seq_part := LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
    result := 'ORD-' || date_part || '-' || seq_part;
    
    -- Vérifier unicité
    WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = result) LOOP
        seq_part := LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
        result := 'ORD-' || date_part || '-' || seq_part;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
        GROUP BY table_name
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- Fonction pour calculer la marge bénéficiaire
CREATE OR REPLACE FUNCTION calculate_margin(sell_price DECIMAL, cost_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF sell_price IS NULL OR sell_price = 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND(((sell_price - COALESCE(cost_price, 0)) / sell_price) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 18. VUES UTILES
-- ============================================================

-- Vue: Produits avec traductions (français par défaut)
CREATE VIEW v_products_fr AS
SELECT 
    p.*,
    pt.name AS product_name,
    pt.description AS product_description,
    pt.short_description,
    calculate_margin(p.sell_price, p.cost_price) AS margin_percent
FROM products p
LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.locale = 'fr'
WHERE p.is_active = TRUE;

-- Vue: Résumé des commandes
CREATE VIEW v_order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.customer_email,
    o.shipping_customer_name,
    o.shipping_country_code,
    o.total_amount,
    o.currency,
    o.status,
    o.cj_order_status,
    o.tracking_number,
    o.created_at,
    COUNT(oi.id) AS item_count,
    p.status AS payment_status
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY o.id, p.status;

-- Vue: Tableau de bord revenus
CREATE VIEW v_revenue_dashboard AS
SELECT 
    DATE_TRUNC('day', o.created_at) AS order_date,
    COUNT(*) AS total_orders,
    SUM(o.total_amount) AS total_revenue,
    SUM(o.total_amount - COALESCE(o.cj_order_amount, 0)) AS total_profit,
    AVG(o.total_amount) AS avg_order_value
FROM orders o
WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY order_date DESC;

-- ============================================================
-- FIN DU SCHEMA
-- ============================================================

COMMENT ON TABLE products IS 'Produits synchronisés depuis CJ Dropshipping API V2.0';
COMMENT ON TABLE orders IS 'Commandes clients, liées à CJ via createOrderV2/V3';
COMMENT ON TABLE payments IS 'Paiements Stripe et PayPal';
COMMENT ON TABLE shipment_tracking IS 'Suivi livraison via AfterShip + CJ tracking';
COMMENT ON TABLE cj_config IS 'Configuration et credentials API CJ Dropshipping';
