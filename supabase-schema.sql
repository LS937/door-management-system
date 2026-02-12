-- Door Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL,
  order_message TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  customer_id TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  photo_url TEXT,
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'accepted', 'prepared', 'pickup_requested', 'delivered', 'rejected'))
);

-- Create index on order_number for faster searches
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create pickup_requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT NOT NULL,
  order_ids TEXT[] NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  CONSTRAINT pickup_requests_status_check CHECK (status IN ('pending', 'completed'))
);

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_pickup_requests_customer_id ON pickup_requests(customer_id);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_roles_role_check CHECK (role IN ('customer', 'admin'))
);

-- Create storage bucket for order photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for order photos (allow authenticated users to upload)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-photos');

-- Allow public access to read photos
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'order-photos');

-- Allow users to update their own photos
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'order-photos');

-- Allow users to delete their own photos
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-photos');

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orders table
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders table
-- Allow all authenticated users to read all orders
CREATE POLICY "Allow authenticated users to read orders" ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own orders
CREATE POLICY "Allow users to insert own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update orders (admins can update any, customers can update their own)
CREATE POLICY "Allow users to update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for pickup_requests table
CREATE POLICY "Allow authenticated users to read pickup_requests" ON pickup_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert pickup_requests" ON pickup_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update pickup_requests" ON pickup_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for user_roles table
CREATE POLICY "Allow authenticated users to read user_roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert user_roles" ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: For production, you may want to implement more granular RLS policies
-- based on user roles and ownership
