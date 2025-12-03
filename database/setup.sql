-- BarberFlow Database Setup for Supabase
-- Execute este script no SQL Editor do Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('platform_admin', 'admin', 'member');
CREATE TYPE appointment_status AS ENUM ('confirmed', 'pending', 'canceled', 'completed');

-- Barbershops table
CREATE TABLE IF NOT EXISTS barbershops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    work_hours JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    last_visit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(whatsapp, barbershop_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    service_ids UUID[] NOT NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_barbershop_id ON users(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_barbershop_id ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_barbershop_id ON clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON clients(whatsapp);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop_id ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON barbershops(slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON barbershops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Platform Admin can see everything
CREATE POLICY "Platform admins can view all barbershops" ON barbershops FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'platform_admin'
    )
);

-- Barbershop admins can only see their own barbershop
CREATE POLICY "Barbershop admins can view their barbershop" ON barbershops FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = barbershops.id
        AND users.role IN ('admin', 'member')
    )
);

-- Users can view their own data and colleagues in same barbershop
CREATE POLICY "Users can view their profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view colleagues" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.barbershop_id = users.barbershop_id
    )
);

-- Platform admins can view all users
CREATE POLICY "Platform admins can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'platform_admin'
    )
);

-- Services policies
CREATE POLICY "Users can view services in their barbershop" ON services FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = services.barbershop_id
    )
);

-- Clients policies
CREATE POLICY "Users can view clients in their barbershop" ON clients FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = clients.barbershop_id
    )
);

-- Appointments policies
CREATE POLICY "Users can view appointments in their barbershop" ON appointments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = appointments.barbershop_id
    )
);

-- Insert policies (similar structure)
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = barbershop_id
        AND users.role = 'admin'
    )
);

CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = barbershop_id
    )
);

CREATE POLICY "Users can insert appointments" ON appointments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.barbershop_id = barbershop_id
    )
);