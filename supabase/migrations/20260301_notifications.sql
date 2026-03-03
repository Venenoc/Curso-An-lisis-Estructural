-- Tabla de notificaciones en tiempo real para usuarios
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT,
  type       TEXT        NOT NULL DEFAULT 'info',
  -- Tipos: 'certificate' | 'quiz_passed' | 'quiz_failed' | 'info'
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop first to allow re-running this migration
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

-- El usuario solo puede ver sus propias notificaciones
CREATE POLICY "notifications_select"
  ON notifications FOR SELECT
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- El usuario puede marcarlas como leídas (UPDATE solo del campo read)
CREATE POLICY "notifications_update"
  ON notifications FOR UPDATE
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- INSERT solo vía admin client (service role) desde el servidor
