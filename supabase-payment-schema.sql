-- Tabelas para Pagamento e Notificações
-- Execute no SQL Editor do Supabase

-- Tabela de Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE, -- ID único do pagamento (pix_xxx, btc_xxx)
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'expired')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('pix', 'bitcoin', 'credit_card', 'debit_card')) NOT NULL,
  payment_data JSONB, -- Dados específicos do método (PIX code, Bitcoin address, etc)
  expires_at TIMESTAMP WITH TIME ZONE, -- Quando o pagamento expira
  confirmed_at TIMESTAMP WITH TIME ZONE, -- Quando foi confirmado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  client_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_2h', 'payment_pending', 'payment_confirmed', 'cancellation')) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas na tabela appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT true;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Índices para performance
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_appointments_payment_status ON appointments(payment_status);

-- Triggers para updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read barbershop payments" ON payments
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE barbershop_id IN (
        SELECT barbershop_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Public can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- RLS Policies para Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read barbershop notifications" ON notifications
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE barbershop_id IN (
        SELECT barbershop_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage notifications" ON notifications
  FOR ALL USING (true);