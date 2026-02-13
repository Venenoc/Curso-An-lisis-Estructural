-- Deshabilitar el trigger automático que está causando problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- La política de INSERT ya la agregamos antes, pero la recreamos por si acaso
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "System can insert profiles" 
    ON profiles FOR INSERT 
    WITH CHECK (true);
