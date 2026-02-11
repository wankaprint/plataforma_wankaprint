-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price_1k DECIMAL(10,2) NOT NULL DEFAULT 0,
    base_price_2k DECIMAL(10,2) NOT NULL DEFAULT 0,
    base_price_3k DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_quantity INT DEFAULT 1000
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);

-- Insert Demo Data (so the catalog is not empty)
INSERT INTO products (name, description, image_url, base_price_1k, base_price_2k, base_price_3k)
VALUES 
('Tarjetas de Presentación', 'Tarjetas personales 9x5cm, papel couché 300gr, acabado mate o brillante.', '/images/tarjetas.jpg', 50.00, 90.00, 120.00),
('Volantes A5', 'Volantes publicitarios tamaño A5 (mitad de A4), papel couché 115gr, impresión full color.', 'https://images.unsplash.com/photo-1559136555-9303dff5a1e5?auto=format&fit=crop&q=80&w=1200', 80.00, 150.00, 210.00),
('Gigantografías (m2)', 'Lona banner 13 onzas, impresión alta resolución 1440dpi, incluye ojales.', 'https://images.unsplash.com/photo-1520188741366-be8709d6f344?auto=format&fit=crop&q=80&w=1200', 25.00, 48.00, 70.00);
