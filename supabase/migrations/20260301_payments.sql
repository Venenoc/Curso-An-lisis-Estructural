-- Tabla de pagos para integración con MercadoPago
-- DROP permite re-ejecutar la migración si la tabla existe con esquema diferente
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id        UUID        REFERENCES courses(id) ON DELETE SET NULL,
  module_position  INTEGER,                          -- posición del módulo (1-based) si es compra de módulo
  amount           NUMERIC(10,2) NOT NULL,
  currency         TEXT        NOT NULL DEFAULT 'USD',
  mp_payment_id    BIGINT      UNIQUE,               -- ID del pago en MercadoPago
  mp_status        TEXT,                             -- approved | in_process | pending | rejected | cancelled
  mp_status_detail TEXT,                             -- detalle del rechazo (cc_rejected_insufficient_amount, etc.)
  type             TEXT        NOT NULL DEFAULT 'course', -- 'course' | 'module'
  external_ref     UUID        UNIQUE NOT NULL DEFAULT uuid_generate_v4(), -- referencia idempotente
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_profile    ON payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_id      ON payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_ext_ref    ON payments(external_ref);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede ver sus propios pagos
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- INSERT y UPDATE solo vía admin client (service role)
