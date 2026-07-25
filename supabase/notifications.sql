-- Ejecuta esto en Supabase → SQL Editor si aún no tienes las tablas de notificaciones

-- Push notification preferences
create table if not exists notification_preferences (
  user_id uuid primary key references auth.users on delete cascade,
  phone_number text,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  reminder_minutes int not null default 60,
  updated_at timestamptz not null default now()
);

-- Si ya tienes la tabla, agrega las columnas SMS:
alter table notification_preferences add column if not exists phone_number text;
alter table notification_preferences add column if not exists sms_enabled boolean not null default false;

alter table notification_preferences enable row level security;

create policy "Users manage own notification preferences"
  on notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Web push subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions (user_id);

-- Reminder delivery log (avoid duplicate notifications)
create table if not exists calendar_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  event_id uuid references calendar_events on delete cascade not null,
  reminder_minutes int not null,
  sent_at timestamptz not null default now(),
  unique (event_id, reminder_minutes)
);

alter table calendar_reminder_logs enable row level security;

create policy "Users read own reminder logs"
  on calendar_reminder_logs for select
  using (auth.uid() = user_id);

create index if not exists calendar_reminder_logs_user_id_idx on calendar_reminder_logs (user_id);
