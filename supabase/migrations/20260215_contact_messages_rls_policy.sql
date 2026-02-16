-- Permitir inserts públicos en contact_messages (solo para inserts, no para select/update/delete)
create policy "Allow public insert for contact_messages" on contact_messages
  for insert
  to public
  with check (true);
