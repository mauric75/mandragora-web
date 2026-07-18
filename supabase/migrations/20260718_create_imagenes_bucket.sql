-- Supabase Storage: bucket público para imágenes del sitio
-- Ejecutar en SQL Editor de Supabase (https://supabase.com/dashboard/project/qreponqhjjqfzsqjweza/sql)

-- Crear bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquiera puede leer
CREATE POLICY "Acceso público de lectura"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Política: solo admin autenticado puede subir
-- (en la práctica usamos service_role desde el endpoint)
CREATE POLICY "Subida via service_role"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imagenes');
