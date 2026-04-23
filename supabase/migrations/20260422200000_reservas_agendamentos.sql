-- Sistema de reservas com pagamento PIX obrigatório antes da confirmação.
-- Reserva bloqueia o slot por 10 minutos enquanto aguarda o pagamento.
-- Agendamento é criado apenas após confirmação do webhook do Mercado Pago.

-- ─── RESERVAS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservas (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id   UUID          NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  profissional_id UUID         REFERENCES public.users(id) ON DELETE SET NULL,
  servico_ids    UUID[]        NOT NULL DEFAULT '{}',
  horario        TIMESTAMPTZ   NOT NULL,
  horario_fim    TIMESTAMPTZ   NOT NULL,
  cliente_nome   TEXT          NOT NULL,
  cliente_whatsapp TEXT        NOT NULL,
  cliente_email  TEXT,
  valor          NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  status         TEXT          NOT NULL DEFAULT 'aguardando_pagamento'
                               CHECK (status IN ('aguardando_pagamento','pago','expirado','cancelado')),
  mp_payment_id  TEXT,
  mp_qr_code     TEXT,
  mp_qr_code_base64 TEXT,
  mp_ticket_url  TEXT,
  expires_at     TIMESTAMPTZ   NOT NULL,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- Impede dupla reserva ativa para o mesmo profissional + horário na mesma barbearia.
-- Slots expirados/cancelados ficam livres automaticamente.
CREATE UNIQUE INDEX IF NOT EXISTS reservas_slot_active_unique
  ON public.reservas (barbearia_id, profissional_id, horario)
  WHERE status IN ('aguardando_pagamento', 'pago');

CREATE INDEX IF NOT EXISTS idx_reservas_barbearia_status
  ON public.reservas (barbearia_id, status);

CREATE INDEX IF NOT EXISTS idx_reservas_mp_payment_id
  ON public.reservas (mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_expires
  ON public.reservas (expires_at)
  WHERE status = 'aguardando_pagamento';

-- ─── AGENDAMENTOS ─────────────────────────────────────────────────────────────
-- Criado pelo webhook após pagamento confirmado. Registro imutável.
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id     UUID          NOT NULL UNIQUE REFERENCES public.reservas(id),
  barbearia_id   UUID          NOT NULL REFERENCES public.barbershops(id),
  profissional_id UUID         REFERENCES public.users(id),
  servico_ids    UUID[]        NOT NULL DEFAULT '{}',
  horario        TIMESTAMPTZ   NOT NULL,
  horario_fim    TIMESTAMPTZ   NOT NULL,
  cliente_nome   TEXT          NOT NULL,
  cliente_whatsapp TEXT        NOT NULL,
  valor          NUMERIC(10,2) NOT NULL,
  mp_payment_id  TEXT,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_barbearia_horario
  ON public.agendamentos (barbearia_id, horario);

CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_horario
  ON public.agendamentos (profissional_id, horario);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.reservas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Membros da barbearia lêem/gerenciam suas reservas
DROP POLICY IF EXISTS "reservas_member_all" ON public.reservas;
CREATE POLICY "reservas_member_all" ON public.reservas
  FOR ALL USING (
    barbearia_id IN (SELECT barbershop_id FROM public.users WHERE id = auth.uid())
    OR is_platform_admin()
  );

-- Agendamentos: membros da barbearia lêem
DROP POLICY IF EXISTS "agendamentos_member_select" ON public.agendamentos;
CREATE POLICY "agendamentos_member_select" ON public.agendamentos
  FOR SELECT USING (
    barbearia_id IN (SELECT barbershop_id FROM public.users WHERE id = auth.uid())
    OR is_platform_admin()
  );
