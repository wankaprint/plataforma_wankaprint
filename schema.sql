-- TABLA DE PEDIDOS (SEGÚN TU ESPECIFICACIÓN)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_code TEXT UNIQUE NOT NULL, -- Ej: WNK-001
    
    -- Datos del Cliente
    customer_name TEXT NOT NULL,
    customer_lastname TEXT NOT NULL,
    customer_phone TEXT NOT NULL, -- Para WhatsApp
    customer_dni TEXT, -- Opcional
    
    -- Datos del Producto (Guardamos snapshot por si cambian precios luego)
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    material_type TEXT NOT NULL, -- Ej: Mate 300gr
    
    -- Archivos (URLs de Supabase Storage)
    user_file_url TEXT NOT NULL, -- El diseño del cliente
    payment_proof_url TEXT, -- La captura del Yape
    
    -- Datos Económicos
    payment_method_type TEXT NOT NULL, -- 'ADELANTO_60_RECOJO' | 'TOTAL_RECOJO' | 'TOTAL_ENVIO'
    product_price DECIMAL(10,2) NOT NULL, -- Precio base calculado
    delivery_fee DECIMAL(10,2) DEFAULT 0.00, -- 8.00 si aplica
    total_amount DECIMAL(10,2) NOT NULL, -- Lo que el cliente debe pagar en total
    amount_paid DECIMAL(10,2) NOT NULL, -- Lo que el cliente pagó (Yapeó)
    
    -- Estados
    status TEXT DEFAULT 'pendiente_confirmacion', -- pendiente_confirmacion, confirmado, impreso, entregado
    is_delivery BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS en orders (opcional, por ahora lo dejamos abierto o básico)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para crear pedidos (cualquiera puede crear, incluso anónimos si usas anon key)
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);

-- Política para ver pedidos (solo admin o el propio usuario si tuvieras auth)
-- Por simplicidad del MVP, permitimos lectura pública o restringimos luego en el backend.
CREATE POLICY "Enable read for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable updat for all users" ON orders FOR UPDATE USING (true);


-- CONFIGURACIÓN DE STORAGE
-- Buckets: products (public), client_files (private/restricted), payments (private/restricted)

-- 1. Bucket 'products' (Ya debe existir, aseguramos políticas)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
CREATE POLICY "Public Access to Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

-- 2. Bucket 'client_files'
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client_files', 'client_files', false);

-- Política: Cualquiera puede SUBIR archivos (el cliente sube su diseño)
CREATE POLICY "Allow public uploads to client_files" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'client_files' );

-- Política: Solo autenticados (Admin) pueden VER/DESCARGAR
-- O si usas Signed URLs, no necesitas política select pública.
-- Si quieres verlos desde el admin panel sin signed urls complicadas, podrías hacerlo público pero con nombres difíciles.
-- Por seguridad, mejor usamos Signed URLs en el admin, así que no damos SELECT público.

-- 3. Bucket 'payments'
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payments', 'payments', false);

-- Política: Cualquiera puede SUBIR (el cliente sube su voucher)
CREATE POLICY "Allow public uploads to payments" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'payments' );

-- Política: Solo Admin ve.
