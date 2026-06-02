DO $$
DECLARE
  new_user_id uuid;
  gerente_perfil_id uuid;
BEGIN
  -- Insert the profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM public.perfil_acesso WHERE descricao ILIKE 'Gerente') THEN
    INSERT INTO public.perfil_acesso (descricao) VALUES ('Gerente');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.perfil_acesso WHERE descricao ILIKE 'Supervisor') THEN
    INSERT INTO public.perfil_acesso (descricao) VALUES ('Supervisor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.perfil_acesso WHERE descricao ILIKE 'Membro Comum') THEN
    INSERT INTO public.perfil_acesso (descricao) VALUES ('Membro Comum');
  END IF;
  
  -- Create seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'matotonprado@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'matotonprado@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    SELECT id INTO gerente_perfil_id FROM public.perfil_acesso WHERE descricao ILIKE 'Gerente' LIMIT 1;

    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, ativo)
    VALUES (new_user_id, 'matotonprado@gmail.com', 'Admin', gerente_perfil_id, true)
    ON CONFLICT (id) DO UPDATE SET perfil_acesso_id = EXCLUDED.perfil_acesso_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_perfil_padrao_id UUID;
BEGIN
  SELECT id INTO v_perfil_padrao_id FROM public.perfil_acesso WHERE descricao ILIKE 'Membro Comum' LIMIT 1;
  IF v_perfil_padrao_id IS NULL THEN
    SELECT id INTO v_perfil_padrao_id FROM public.perfil_acesso WHERE descricao ILIKE 'visualizador' LIMIT 1;
  END IF;

  INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    v_perfil_padrao_id,
    'ativo'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;
