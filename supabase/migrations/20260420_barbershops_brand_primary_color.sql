-- Cor de destaque opcional do painel da barbearia (#RRGGBB); NULL = automática
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS brand_primary_color text;

COMMENT ON COLUMN public.barbershops.brand_primary_color IS 'Cor principal da marca no dashboard (#RRGGBB). NULL = paleta automática por barbearia.';
