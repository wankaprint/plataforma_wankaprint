-- =============================================
-- 1. LIMPIEZA PREVIA (Opcional, ten cuidado si ya tienes datos)
-- =============================================
-- DROP TABLE IF EXISTS orders;
-- DROP TRIGGER IF EXISTS set_order_code ON orders;
-- DROP FUNCTION IF EXISTS generate_order_code;
-- DROP SEQUENCE IF EXISTS order_code_seq;

-- =============================================
-- 2. SECUENCIA PARA EL CÓDIGO DE PEDIDO (WNK-001)
-- =============================================
CREATE SEQUENCE IF NOT EXISTS order_code_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Genera WNK-0001, WNK-0002, etc. LPAD rellena con ceros.
    NEW.order_code := 'WNK-' || LPAD(nextval('order_code_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. TABLA DE PEDIDOS (Orders)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Este campo se llenará automáticamente por el trigger, pero lo dejamos NULLABLE en la definición inicial
    -- para que la inserción no falle si no se envía.
    order_code TEXT UNIQUE, 
    
    -- Datos del Cliente
    customer_name TEXT NOT NULL,
    customer_lastname TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_dni TEXT, -- Opcional
    
    -- Datos del Producto
    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    material_type TEXT DEFAULT 'Estándar',
    
    -- Archivos (Paths relativos o URLs)
    user_file_url TEXT NOT NULL,
    payment_proof_url TEXT,
    
    -- Datos Económicos
    payment_method_type TEXT NOT NULL, -- 'ADELANTO_60_RECOJO' | 'TOTAL_RECOJO' | 'TOTAL_ENVIO'
    product_price DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    
    -- Estados
    status TEXT DEFAULT 'pendiente_confirmacion',
    is_delivery BOOLEAN DEFAULT FALSE
);

-- Trigger para asignar el código automáticamente antes de insertar
CREATE TRIGGER set_order_code
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_code();

-- =============================================
-- 4. SEGURIDAD (RLS) PARA TABLA ORDERS
-- =============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir a CUALQUIERA insertar pedidos (necesario para usuarios públicos)
CREATE POLICY "Enable insert for all users" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Permitir a CUALQUIERA ver pedidos (Para el MVP Admin Panel sin login complejo)
-- NOTA: En producción, esto debería ser solo para rol 'service_role' o admins autenticados.
CREATE POLICY "Enable read for all users" 
ON orders FOR SELECT 
USING (true);

-- Permitir actualizar estados (Para el Admin Panel)
CREATE POLICY "Enable update for all users" 
ON orders FOR UPDATE 
USING (true);

-- =============================================
-- 5. CONFIGURACIÓN DE STORAGE (Buckets)
-- =============================================
-- Inserta los buckets si no existen (Supabase a veces requiere crearlos desde la UI, 
-- pero este script intenta insertarlos en la tabla interna storage.buckets si tienes permisos).
-- Si falla esta parte, crea los buckets MANUALMENTE en la UI de Supabase:
-- 'products' (Public), 'client_files' (Public/Private), 'payments' (Public/Private)

-- NOTA: Para este script usamos políticas asumiendo que los buckets ya existen o se crean.
-- Vamos a dar permisos PÚBLICOS DE ESCRITURA (INSERT) para que la App pueda subir sin loguearse.

-- ---------------------------------------------
-- Bucket: client_files
-- ---------------------------------------------
-- Política para SUBIR archivos (Cualquiera puede subir)
CREATE POLICY "Allow public uploads to client_files" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'client_files' );

-- Política para VER archivos (Para que el Admin pueda descargarlos)
CREATE POLICY "Allow public select to client_files" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'client_files' );

-- ---------------------------------------------
-- Bucket: payments
-- ---------------------------------------------
-- Política para SUBIR archivos
CREATE POLICY "Allow public uploads to payments" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'payments' );

-- Política para VER archivos
CREATE POLICY "Allow public select to payments" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'payments' );

-- ---------------------------------------------
-- Bucket: products (Para imágenes del catálogo)
-- ---------------------------------------------
CREATE POLICY "Allow public select to products" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

-- FIN DEL SCRIPT
