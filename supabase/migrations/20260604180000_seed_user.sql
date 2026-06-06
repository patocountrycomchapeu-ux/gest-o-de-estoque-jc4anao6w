DO $$
DECLARE
  new_user_id uuid;
  v_perfil_gestor_id uuid;
BEGIN
  -- Ensure 'Gestor' profile exists
  SELECT id INTO v_perfil_gestor_id FROM public.perfil_acesso WHERE descricao ILIKE 'gestor' LIMIT 1;
  IF v_perfil_gestor_id IS NULL THEN
    v_perfil_gestor_id := gen_random_uuid();
    INSERT INTO public.perfil_acesso (id, descricao, permissoes)
    VALUES (v_perfil_gestor_id, 'Gestor', '{"all": true}'::jsonb);
  END IF;

  -- Seed user matotonprado@gmail.com
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
      '{"full_name": "Matoton Prado"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
    VALUES (
      new_user_id,
      'matotonprado@gmail.com',
      'Matoton Prado',
      v_perfil_gestor_id,
      'ativo'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
