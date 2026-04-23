-- =============================================================================
-- Migration: Tabelas para o fluxo PIX Mercado Pago (reserva + agendamento)
-- Criado: 2026-04-23
-- =============================================================================

-- ── Tabela reservas ────────────────────────────────────────────────────────────
-- Slot temporário criado ANTES do pagamento. Expira em 10 min se não pago.
CREATE TABLE IF NOT EXISTS reservas (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id       uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  profissional_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  servico_ids        text[]       NOT NULL DEFAULT '{}',
  horario            timestamptz  NOT NULL,
  horario_fim        timestamptz  NOT NULL,
  cliente_nome       text         NOT NULL,
  cliente_whatsapp   text         NOT NULL,
  cliente_email      text,
  valor              numeric(10,2) NOT NULL,
  status             text         NOT NULL DEFAULT 'aguardando_pagamento'
                     CHECK (status IN ('aguardando_pagamento','pago','cancelado','expirado')),
  expires_at         timestamptz  NOT NULL,
  -- Campos preenchidos após criar PIX no Mercado Pago
  mp_payment_id      text,
  mp_qr_code         text,
  mp_qr_code_base64  text,
  mp_ticket_url      text,
  created_at         timestamptz  DEFAULT now()
);

-- Índice único: impede 2 reservas ativas para o mesmo profissional/horário
-- Libera o slot quando status sai de 'aguardando_pagamento' ou 'pago'
CREATE UNIQUE INDEX IF NOT EXISTS reservas_slot_unique
  ON reservas (barbearia_id, COALESCE(profissional_id, '00000000-0000-0000-0000-000000000000'::uuid), horario)
  WHERE status IN ('aguardando_pagamento', 'pago');

-- ── Tabela agendamentos ────────────────────────────────────────────────────────
-- Slot CONFIRMADO. Criado pelo webhook mercadopago-webhook após aprovação do PIX.
CREATE TABLE IF NOT EXISTS agendamentos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id         uuid UNIQUE REFERENCES reservas(id) ON DELETE SET NULL,
  barbearia_id       uuid NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  profissional_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  servico_ids        text[]       NOT NULL DEFAULT '{}',
  horario            timestamptz  NOT NULL,
  horario_fim        timestamptz  NOT NULL,
  cliente_nome       text         NOT NULL,
  cliente_whatsapp   text         NOT NULL,
  valor              numeric(10,2),
  mp_payment_id      text,
  created_at         timestamptz  DEFAULT now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE reservas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Anônimos podem criar e ver reservas (booking público sem login)
CREATE POLICY "anon_insert_reservas"   ON reservas FOR INSERT TO anon      WITH CHECK (true);
CREATE POLICY "anon_select_reservas"   ON reservas FOR SELECT TO anon      USING (true);
CREATE POLICY "auth_select_reservas"   ON reservas FOR SELECT TO authenticated USING (true);

-- Service role (Edge Functions) tem acesso irrestrito
CREATE POLICY "service_all_reservas"   ON reservas     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_agendamentos" ON agendamentos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Autenticados (admins de barbearia) podem ver agendamentos
CREATE POLICY "auth_select_agendamentos" ON agendamentos FOR SELECT TO authenticated USING (true);
