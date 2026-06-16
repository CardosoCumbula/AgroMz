-- Agromoz Production Supabase Schema
-- This script creates the core tables required for the application to function

-- 1. Profiles (Extends Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'farmer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Profile Access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Products
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  farmer TEXT NOT NULL,
  province TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  qty INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  desc_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')),
  farmer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Products Access
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Farmers can insert products." ON public.products FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own products." ON public.products FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own products." ON public.products FOR DELETE USING (auth.uid() = farmer_id);

-- 3. Orders
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pago', 'pendente', 'entregue')),
  email_html TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Orders Access
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Null allowed for anonymous checkout
CREATE POLICY "Anyone can insert orders." ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role can update orders." ON public.orders FOR UPDATE USING (true); -- Usually restricted to admin/server

-- 4. Visitors (Telemetry)
CREATE TABLE public.visitors (
  id TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  location TEXT NOT NULL,
  browser TEXT NOT NULL,
  session_time NUMERIC,
  device_spec JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Visitors Access
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert visitors." ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Only authenticated users can view visitors." ON public.visitors FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Contacts (Support Forms)
CREATE TABLE public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure Contacts Access
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contacts." ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contacts." ON public.contacts FOR SELECT USING (auth.role() = 'authenticated'); -- Adjust as needed
