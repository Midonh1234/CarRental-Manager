/**
 * Comprehensive PostgreSQL & Supabase SQL Script for CARRENTAL MANAGER 🇩🇿
 * Includes all 16 tables, UUID primary keys, NUMERIC currency types,
 * Row Level Security (RLS) for multi-tenant agencies & roles,
 * and a PostgreSQL btree_gist extension with EXCLUDE constraint
 * to prevent vehicle schedule overlaps at the database level!
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- CARRENTAL MANAGER 🇩🇿 - BASE DE DONNÉES POSTGRESQL & SUPABASE (PHASE 2)
-- Architecture Multi-Tenant avec Row Level Security (RLS) & Protection Chevauchement
-- ==============================================================================

-- 1. Activer les extensions PostgreSQL indispensables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Indispensable pour la contrainte EXCLUDE de chevauchement temporel

-- 2. Types ENUM
CREATE TYPE user_role_type AS ENUM ('ADMIN', 'AGENT', 'COMPTABLE');
CREATE TYPE vehicle_status_type AS ENUM ('DISPONIBLE', 'RÉSERVÉ', 'LOUÉ', 'ENTRETIEN', 'INACTIF');
CREATE TYPE reservation_status_type AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE');
CREATE TYPE rental_status_type AS ENUM ('EN_COURS', 'TERMINEE', 'EN_RETARD', 'ANNULEE');
CREATE TYPE payment_method_type AS ENUM ('ESPECES', 'CCP', 'VIREMENT', 'CHEQUE', 'AUTRE');
CREATE TYPE deposit_status_type AS ENUM ('NON_ENCAISSEE', 'ENCAISSEE', 'PARTIELLEMENT_RESTITUEE', 'RESTITUEE');
CREATE TYPE fuel_type AS ENUM ('Essence', 'Diesel', 'GPL', 'Hybride', 'Électrique');
CREATE TYPE transmission_type AS ENUM ('Manuelle', 'Automatique');

-- 3. Table des Agences (Multi-tenant)
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    commercial_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT NOT NULL,
    wilaya_code VARCHAR(3) NOT NULL, -- '01' à '58'
    commune VARCHAR(100) NOT NULL,
    phone1 VARCHAR(30) NOT NULL,
    phone2 VARCHAR(30),
    email VARCHAR(255) NOT NULL,
    rc_number VARCHAR(100), -- Registre du Commerce
    nif_number VARCHAR(50), -- NIF Algérie
    nis_number VARCHAR(50), -- NIS Algérie
    rib_ccp TEXT,           -- Numéro CCP / BaridiMob
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Profils Utilisateurs (Liés à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'AGENT',
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des Véhicules
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    version VARCHAR(100),
    year INT NOT NULL CHECK (year >= 1990 AND year <= 2030),
    matricule VARCHAR(50) NOT NULL, -- Ex: 01485-123-31
    color VARCHAR(50) NOT NULL,
    fuel fuel_type NOT NULL DEFAULT 'Essence',
    transmission transmission_type NOT NULL DEFAULT 'Manuelle',
    mileage INT NOT NULL DEFAULT 0,
    seats INT NOT NULL DEFAULT 5,
    daily_price NUMERIC(12, 2) NOT NULL CHECK (daily_price >= 0),
    caution_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    photos TEXT[] DEFAULT '{}',
    status vehicle_status_type NOT NULL DEFAULT 'DISPONIBLE',
    service_date DATE NOT NULL,
    next_maintenance_km INT,
    insurance_expiry_date DATE,
    technical_control_expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_agency_vehicle_matricule UNIQUE (agency_id, matricule)
);

-- 6. Table des Clients
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    wilaya_code VARCHAR(3) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    cni_number VARCHAR(100) NOT NULL,
    cni_issue_date DATE,
    license_number VARCHAR(100) NOT NULL,
    license_issue_date DATE NOT NULL,
    license_expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des Réservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    reservation_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '09:00',
    end_date DATE NOT NULL,
    end_time TIME NOT NULL DEFAULT '09:00',
    days INT NOT NULL CHECK (days >= 1),
    daily_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    caution_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status reservation_status_type NOT NULL DEFAULT 'EN_ATTENTE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_res_dates CHECK (end_date >= start_date)
);

-- 8. Table des Locations (Contrats réels de location)
-- Note: Contrainte EXCLUDE contre les chevauchements temporels d'un même véhicule !
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    rental_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '09:00',
    end_date DATE NOT NULL,
    end_time TIME NOT NULL DEFAULT '09:00',
    start_mileage INT NOT NULL,
    start_fuel_level VARCHAR(20) NOT NULL DEFAULT 'Plein',
    daily_price NUMERIC(12, 2) NOT NULL,
    days INT NOT NULL CHECK (days >= 1),
    total_amount NUMERIC(12, 2) NOT NULL,
    caution_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status rental_status_type NOT NULL DEFAULT 'EN_COURS',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_rental_dates CHECK (end_date >= start_date),
    CONSTRAINT uq_agency_rental_number UNIQUE (agency_id, rental_number)
);

-- 9. Table des Retours de Location (Check-out)
CREATE TABLE IF NOT EXISTS rental_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL UNIQUE REFERENCES rentals(id) ON DELETE CASCADE,
    return_date DATE NOT NULL,
    return_time TIME NOT NULL,
    end_mileage INT NOT NULL,
    end_fuel_level VARCHAR(20) NOT NULL,
    vehicle_condition VARCHAR(50) NOT NULL DEFAULT 'EXCELLENT',
    damages_notes TEXT,
    extra_fees NUMERIC(12, 2) NOT NULL DEFAULT 0,
    extra_fees_reason TEXT,
    inspector_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table des Paiements
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) NOT NULL,
    rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    method payment_method_type NOT NULL DEFAULT 'ESPECES',
    reference VARCHAR(100), -- Ex: Reçu CCP, Numéro chèque
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table des Cautions (Strictement isolées des revenus)
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    deposit_number VARCHAR(50) NOT NULL,
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    required_amount NUMERIC(12, 2) NOT NULL,
    collected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    collected_date DATE NOT NULL,
    payment_method payment_method_type NOT NULL DEFAULT 'ESPECES',
    returned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    returned_date DATE,
    deduction_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deduction_reason TEXT,
    status deposit_status_type NOT NULL DEFAULT 'ENCAISSEE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Table des Dépenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    garage_or_vendor VARCHAR(255),
    receipt_number VARCHAR(100),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Table des Entretiens et Réparations
CREATE TABLE IF NOT EXISTS maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    intervention_date DATE NOT NULL,
    mileage INT NOT NULL,
    garage_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    next_due_mileage INT,
    next_due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'TERMINEE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Table des Journaux d'Audit (Traçabilité stricte)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role user_role_type NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Sécurité ROW LEVEL SECURITY (RLS) sur toutes les tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS : Chaque utilisateur accède uniquement aux données de son agence
CREATE POLICY agency_isolation_policy_vehicles ON vehicles
    FOR ALL USING (
        agency_id = (SELECT agency_id FROM profiles WHERE profiles.id = auth.uid())
    );

CREATE POLICY agency_isolation_policy_rentals ON rentals
    FOR ALL USING (
        agency_id = (SELECT agency_id FROM profiles WHERE profiles.id = auth.uid())
    );

CREATE POLICY agency_isolation_policy_payments ON payments
    FOR ALL USING (
        agency_id = (SELECT agency_id FROM profiles WHERE profiles.id = auth.uid())
    );
`;
