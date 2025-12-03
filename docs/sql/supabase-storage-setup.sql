-- Configuração do Storage para logos das barbearias
-- Execute no SQL Editor do Supabase

-- IMPORTANTE: Execute este script como usuário postgres ou service_role

-- 1. Criar bucket para assets das barbearias (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'barbershop-assets',
  'barbershop-assets',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can upload barbershop logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view barbershop logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update barbershop logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete barbershop logos" ON storage.objects;

-- 3. Política simplificada para permitir upload (usuários autenticados)
CREATE POLICY "Authenticated users can upload to barbershop-assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'barbershop-assets' 
    AND auth.role() = 'authenticated'
  );

-- 4. Política para permitir visualização pública das logos
CREATE POLICY "Anyone can view barbershop assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'barbershop-assets');

-- 5. Política para permitir atualização (usuários autenticados)
CREATE POLICY "Authenticated users can update barbershop assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'barbershop-assets'
    AND auth.role() = 'authenticated'
  );

-- 6. Política para permitir exclusão (usuários autenticados)
CREATE POLICY "Authenticated users can delete barbershop assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'barbershop-assets'
    AND auth.role() = 'authenticated'
  );

-- 7. Habilitar RLS no storage.objects (se ainda não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;