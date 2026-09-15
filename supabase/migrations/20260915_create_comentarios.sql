-- Create comentarios table for audience reviews on plays and general cartelera
-- Migration: 20260915_create_comentarios

CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id TEXT,                    -- FK lógico a obras.json (ej: "obra-1"), NULL si es comentario general
  nombre TEXT NOT NULL,            -- Nombre del espectador (2-80 chars)
  texto TEXT NOT NULL,             -- Contenido del comentario (3-1000 chars)
  estrellas SMALLINT,              -- Rating 1-5 (opcional, solo para obras)
  destacado BOOLEAN DEFAULT false, -- Marcar como opinión destacada para cartelera general
  fuente TEXT DEFAULT 'usuario',   -- 'usuario' (público) o 'admin' (agregado manualmente)
  creado TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_estrellas CHECK (estrellas IS NULL OR (estrellas >= 1 AND estrellas <= 5)),
  CONSTRAINT chk_nombre CHECK (char_length(nombre) >= 2 AND char_length(nombre) <= 80),
  CONSTRAINT chk_texto CHECK (char_length(texto) >= 3 AND char_length(texto) <= 1000)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_comentarios_obra ON comentarios(obra_id) WHERE obra_id IS NOT NULL;
CREATE INDEX idx_comentarios_destacado ON comentarios(destacado) WHERE destacado = true;
CREATE INDEX idx_comentarios_creado ON comentarios(creado DESC);

-- RLS: lectura pública, escritura solo service_role
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica" ON comentarios
  FOR SELECT
  USING (true);

-- Sin política de INSERT/UPDATE/DELETE para anon/authenticated (solo service_role via API)

-- Datos de ejemplo para que la UI no esté vacía
INSERT INTO comentarios (obra_id, nombre, texto, estrellas, destacado, fuente, creado) VALUES
  ('obra-1', 'María González', 'Increíble experiencia. Mis hijos no pararon de reír y la reflexión sobre las pantallas quedó. ¡Volveremos!', 5, true, 'usuario', now() - interval '3 days'),
  ('obra-1', 'Carlos Pérez', 'Muy buen trabajo actoral. La interactividad engancha a los chicos desde el primer minuto.', 4, true, 'usuario', now() - interval '5 days'),
  ('obra-1', 'Ana Rodríguez', 'Obra original y necesaria. Los chicos salieron hablando del tema. Recomendada.', 5, false, 'usuario', now() - interval '1 week'),
  (NULL, 'Laura Martínez', 'El Teatro Mandrágora es un espacio mágico. Cada vez que vamos disfrutamos muchísimo.', NULL, true, 'admin', now() - interval '2 days'),
  (NULL, 'Pedro Silva', 'Excelente programación. Se nota el amor por el teatro en cada detalle.', NULL, true, 'admin', now() - interval '4 days');
