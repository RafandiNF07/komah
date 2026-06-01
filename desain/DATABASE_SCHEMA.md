# Skema Database Pragmatis (The Sweet Spot)

Skema ini dirancang khusus untuk memenuhi standar keamanan relasional (Production-Grade) namun tetap sangat mudah digunakan oleh tim Frontend dalam waktu 1 minggu.

## Eksekusi SQL
Jalankan script SQL di bawah ini pada SQL Editor di dashboard Supabase Anda.

```sql
-- =========================================================================
-- 1. TYPES & SEQUENCE
-- =========================================================================
CREATE TYPE user_role AS ENUM ('customer', 'driver');
CREATE TYPE order_type AS ENUM ('bike', 'delivery', 'helper', 'food');
CREATE TYPE order_status AS ENUM ('searching', 'accepted', 'on_the_way', 'completed', 'cancelled');

CREATE SEQUENCE order_number_seq;

-- =========================================================================
-- 2. PROFILES TABLE
-- =========================================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    
    license_plate TEXT, 
    vehicle_type TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT check_driver_data CHECK (
        role = 'customer' 
        OR (role = 'driver' AND license_plate IS NOT NULL AND vehicle_type IS NOT NULL)
    )
);

-- =========================================================================
-- 3. ORDERS TABLE
-- =========================================================================
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || lpad(nextval('order_number_seq')::text, 6, '0')),
    
    customer_id UUID REFERENCES profiles(id) NOT NULL,
    driver_id UUID REFERENCES profiles(id),
    type order_type NOT NULL,
    status order_status NOT NULL DEFAULT 'searching',
    
    total_price NUMERIC NOT NULL CHECK (total_price >= 5000), 
    distance_estimate NUMERIC, 
    notes TEXT,
    
    pickup_location TEXT NOT NULL,
    pickup_lat NUMERIC(9,6) NOT NULL CHECK (pickup_lat BETWEEN -90 AND 90),
    pickup_lng NUMERIC(9,6) NOT NULL CHECK (pickup_lng BETWEEN -180 AND 180),
    
    destination_location TEXT,
    destination_lat NUMERIC(9,6) CHECK (destination_lat BETWEEN -90 AND 90),
    destination_lng NUMERIC(9,6) CHECK (destination_lng BETWEEN -180 AND 180),
    
    service_details JSONB DEFAULT '{}'::jsonb,
    
    pickup_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT check_customer_not_driver CHECK (customer_id IS DISTINCT FROM driver_id)
);

-- =========================================================================
-- 4. INDICES
-- =========================================================================
CREATE INDEX idx_orders_service_details ON orders USING GIN (service_details);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_orders_dashboard_searching ON orders(created_at DESC) WHERE status = 'searching';

-- =========================================================================
-- 5. UPDATED_AT TRIGGERS
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- 6. ROW LEVEL SECURITY (Paling Pragmatis & Efisien)
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Agar fitur JOIN Supabase di FE berjalan lancar, akses baca dibuka untuk user yang login
CREATE POLICY "Authenticated users can view profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: Akses CRUD standar
CREATE POLICY "Customers see own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Drivers see active or assigned orders" ON orders FOR SELECT USING (status = 'searching' OR auth.uid() = driver_id);
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Update own orders" ON orders FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = driver_id);

-- =========================================================================
-- 7. RPC: TAKE ORDER (Anti Race Condition)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.take_order(order_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.orders
  SET driver_id = auth.uid(), status = 'accepted'
  WHERE id = order_uuid AND driver_id IS NULL AND status = 'searching';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$;

-- =========================================================================
-- 8. AUTH TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone_number, role, license_plate, vehicle_type)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'), 
      COALESCE(new.email, ''), 
      COALESCE(new.raw_user_meta_data->>'phone_number', ''), 
      COALESCE(new.raw_user_meta_data->>'role', 'customer')::user_role,
      new.raw_user_meta_data->>'license_plate',
      new.raw_user_meta_data->>'vehicle_type'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```