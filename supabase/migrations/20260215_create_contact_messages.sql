-- Tabla para guardar mensajes de contacto
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Activar Row Level Security (RLS)
alter table contact_messages enable row level security;
