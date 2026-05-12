DO $$
DECLARE
  v_admin_role_id uuid;
  v_admin_user_id uuid;
  v_skip_admin_user_id uuid;
BEGIN
  -- Ensure Admin role exists
  SELECT id INTO v_admin_role_id FROM public.perfil_acesso WHERE descricao ILIKE 'admin';
  
  IF v_admin_role_id IS NULL THEN
    v_admin_role_id := gen_random_uuid();
    INSERT INTO public.perfil_acesso (id, descricao, permissoes)
    VALUES (v_admin_role_id, 'Admin', '{"all": true}'::jsonb);
  END IF;

  -- Ensure Visualizador role exists for trigger
  IF NOT EXISTS (SELECT 1 FROM public.perfil_acesso WHERE descricao ILIKE 'visualizador') THEN
    INSERT INTO public.perfil_acesso (id, descricao, permissoes)
    VALUES (gen_random_uuid(), 'Visualizador', '{"read": true}'::jsonb);
  END IF;

  -- Create admin@gestao.com if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gestao.com') THEN
    v_admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@gestao.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- Ensure it's correctly set as admin
    UPDATE public.usuarios
    SET perfil_acesso_id = v_admin_role_id, nome = 'Administrador'
    WHERE id = v_admin_user_id;

    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
    VALUES (v_admin_user_id, 'admin@gestao.com', 'Administrador', v_admin_role_id, 'ativo')
    ON CONFLICT (id) DO UPDATE SET perfil_acesso_id = EXCLUDED.perfil_acesso_id;
  END IF;

  -- Create matotonprado@gmail.com if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'matotonprado@gmail.com') THEN
    v_skip_admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_skip_admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'matotonprado@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Skip Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    UPDATE public.usuarios
    SET perfil_acesso_id = v_admin_role_id, nome = 'Skip Admin'
    WHERE id = v_skip_admin_user_id;

    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
    VALUES (v_skip_admin_user_id, 'matotonprado@gmail.com', 'Skip Admin', v_admin_role_id, 'ativo')
    ON CONFLICT (id) DO UPDATE SET perfil_acesso_id = EXCLUDED.perfil_acesso_id;
  END IF;
END $$;
