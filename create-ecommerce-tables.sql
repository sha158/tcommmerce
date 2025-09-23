-- TCommerce Database Schema
-- This script creates the necessary tables for categories and products

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    original_price DECIMAL(10,2) CHECK (original_price IS NULL OR original_price > 0),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku VARCHAR(50) UNIQUE,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    weight DECIMAL(8,2) CHECK (weight IS NULL OR weight > 0),
    unit VARCHAR(20),
    brand VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Full text search index for products
CREATE INDEX IF NOT EXISTS idx_products_search
ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert common grocery categories
INSERT INTO categories (name, description, image_url) VALUES
('Fruits & Vegetables', 'Fresh fruits and vegetables for healthy living', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'),
('Dairy & Eggs', 'Fresh dairy products and farm eggs', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'),
('Meat & Seafood', 'Fresh meat, poultry, and seafood', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400'),
('Bakery', 'Fresh bread, pastries, and baked goods', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
('Pantry Staples', 'Essential pantry items and dry goods', 'https://images.unsplash.com/photo-1586201375761-83865001e8c3?w=400'),
('Beverages', 'Drinks, juices, and refreshments', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'),
('Snacks', 'Chips, crackers, and snack foods', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'),
('Frozen Foods', 'Frozen meals, vegetables, and desserts', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400'),
('Personal Care', 'Health and personal care products', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'),
('Household Items', 'Cleaning supplies and household essentials', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products for each category
INSERT INTO products (name, description, price, category_id, sku, stock_quantity, image_url, is_featured, weight, unit, brand) VALUES
-- Fruits & Vegetables
('Organic Bananas', 'Fresh organic bananas, perfect for breakfast or snacking', 2.99, 1, 'FRUIT-BAN-001', 50, 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400', true, 1.5, 'lb', 'Organic Farm'),
('Red Apples', 'Crisp and juicy red apples, great for snacking', 3.49, 1, 'FRUIT-APP-001', 40, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', false, 2.0, 'lb', 'Fresh Valley'),
('Baby Spinach', 'Fresh baby spinach leaves, perfect for salads', 3.99, 1, 'VEG-SPI-001', 25, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', false, 0.5, 'lb', 'Green Leaf'),

-- Dairy & Eggs
('Whole Milk', 'Fresh whole milk from local farms', 4.29, 2, 'DAIRY-MILK-001', 30, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', true, 1.0, 'gallon', 'Farm Fresh'),
('Large Eggs', 'Grade A large eggs, dozen pack', 3.79, 2, 'DAIRY-EGG-001', 35, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', false, 1.5, 'dozen', 'Happy Hen'),
('Greek Yogurt', 'Creamy Greek yogurt with probiotics', 5.99, 2, 'DAIRY-YOG-001', 20, 'https://images.unsplash.com/photo-1571212515416-fdc9190d09d7?w=400', false, 32.0, 'oz', 'Pure Greek'),

-- Meat & Seafood
('Chicken Breast', 'Boneless skinless chicken breast', 8.99, 3, 'MEAT-CHK-001', 15, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', true, 1.0, 'lb', 'Premium Poultry'),
('Ground Beef', 'Lean ground beef, 85/15', 6.49, 3, 'MEAT-BEEF-001', 20, 'https://images.unsplash.com/photo-1588347818148-4bc43b7d6f7e?w=400', false, 1.0, 'lb', 'Quality Meats'),
('Salmon Fillet', 'Fresh Atlantic salmon fillet', 12.99, 3, 'FISH-SAL-001', 10, 'https://images.unsplash.com/photo-1574781330855-d0db0cc6a79c?w=400', true, 0.5, 'lb', 'Ocean Fresh'),

-- Bakery
('Whole Wheat Bread', 'Fresh baked whole wheat bread', 2.99, 4, 'BAKERY-BREAD-001', 25, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', false, 24.0, 'oz', 'Artisan Bakery'),
('Croissants', 'Buttery flaky croissants, 6 pack', 4.99, 4, 'BAKERY-CROI-001', 15, 'https://images.unsplash.com/photo-1555507036-ab794f17418a?w=400', true, 12.0, 'oz', 'French Delights'),

-- Pantry Staples
('Jasmine Rice', 'Premium jasmine rice, 5lb bag', 8.99, 5, 'PANTRY-RICE-001', 30, 'https://images.unsplash.com/photo-1586201375761-83865001e8c3?w=400', false, 5.0, 'lb', 'Golden Grain'),
('Olive Oil', 'Extra virgin olive oil, cold pressed', 12.99, 5, 'PANTRY-OIL-001', 20, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', true, 16.9, 'fl oz', 'Mediterranean Gold'),
('Spaghetti Pasta', 'Premium durum wheat spaghetti', 2.49, 5, 'PANTRY-PASTA-001', 40, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', false, 1.0, 'lb', 'Italian Classic'),

-- Beverages
('Orange Juice', 'Fresh squeezed orange juice, no pulp', 4.99, 6, 'BEV-OJ-001', 25, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', true, 64.0, 'fl oz', 'Sunny Grove'),
('Sparkling Water', 'Natural sparkling water, 12 pack', 6.99, 6, 'BEV-SPAR-001', 30, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', false, 144.0, 'fl oz', 'Pure Spring'),
('Coffee Beans', 'Premium Arabica coffee beans', 14.99, 6, 'BEV-COF-001', 20, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', true, 12.0, 'oz', 'Mountain Roast'),

-- Snacks
('Potato Chips', 'Crispy salted potato chips', 3.49, 7, 'SNACK-CHIP-001', 50, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', false, 8.0, 'oz', 'Crispy Crunch'),
('Mixed Nuts', 'Premium mixed nuts, lightly salted', 7.99, 7, 'SNACK-NUTS-001', 25, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', true, 16.0, 'oz', 'Nutty Delights'),

-- Frozen Foods
('Frozen Pizza', 'Margherita frozen pizza', 5.99, 8, 'FROZEN-PIZZA-001', 20, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', true, 14.0, 'oz', 'Bella Italia'),
('Ice Cream', 'Vanilla bean ice cream', 6.99, 8, 'FROZEN-ICE-001', 15, 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400', false, 48.0, 'fl oz', 'Creamy Dreams'),

-- Personal Care
('Shampoo', 'Moisturizing shampoo for all hair types', 8.99, 9, 'CARE-SHAM-001', 30, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', false, 12.0, 'fl oz', 'Healthy Hair'),
('Toothpaste', 'Fluoride toothpaste for cavity protection', 4.99, 9, 'CARE-TOOTH-001', 40, 'https://images.unsplash.com/photo-1609979464336-8b3956b32493?w=400', false, 4.6, 'oz', 'Bright Smile'),

-- Household Items
('All-Purpose Cleaner', 'Multi-surface cleaning spray', 5.99, 10, 'HOUSE-CLEAN-001', 25, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', false, 32.0, 'fl oz', 'Clean Pro'),
('Paper Towels', 'Absorbent paper towels, 8 roll pack', 12.99, 10, 'HOUSE-TOWEL-001', 20, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400', false, 0.0, 'pack', 'Soft Touch')
ON CONFLICT (sku) DO NOTHING;

-- Update product counts and featured status
UPDATE products SET is_featured = true WHERE id IN (1, 4, 6, 9, 11, 14, 17, 19);

COMMIT;