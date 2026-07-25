-- Fix: columnas faltantes en notification_preferences
-- Supabase → SQL Editor → pegar y ejecutar

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS phone_number text;

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS sms_enabled boolean NOT NULL DEFAULT false;

-- Recargar caché del esquema (opcional, Supabase suele actualizar solo en segundos)
NOTIFY pgrst, 'reload schema';
