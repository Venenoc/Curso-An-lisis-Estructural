-- Agregar política para permitir INSERT en profiles
-- Esta política permite que el sistema cree perfiles automáticamente

CREATE POLICY "System can insert profiles" 
    ON profiles FOR INSERT 
    WITH CHECK (true);

-- Alternativa: permitir que los usuarios autenticados creen su propio perfil
-- Descomentar si se prefiere un enfoque más restrictivo
-- CREATE POLICY "Users can insert own profile" 
--     ON profiles FOR INSERT 
--     WITH CHECK (auth.uid() = user_id);
