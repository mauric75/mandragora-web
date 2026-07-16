-- Migración: tabla de auditoría para panel admin
-- Fecha: 2026-07-16

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs (action);

-- RLS: solo el service_role puede escribir/leer
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage logs" ON public.admin_logs;
CREATE POLICY "Service role can manage logs" ON public.admin_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Bloquear acceso público
REVOKE ALL ON public.admin_logs FROM anon, authenticated;
