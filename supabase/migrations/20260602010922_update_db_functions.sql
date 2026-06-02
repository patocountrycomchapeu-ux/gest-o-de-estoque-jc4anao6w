CREATE OR REPLACE FUNCTION public.is_gestor()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_admin BOOLEAN;
BEGIN
  SELECT (p.descricao ILIKE 'gestor' OR p.descricao ILIKE 'gerente') INTO v_admin
  FROM public.usuarios u
  JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
  WHERE u.id = auth.uid();
  RETURN COALESCE(v_admin, false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_admin BOOLEAN;
BEGIN
  SELECT (p.descricao ILIKE 'gestor' OR p.descricao ILIKE 'gerente') INTO v_admin
  FROM public.usuarios u
  JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
  WHERE u.id = auth.uid();
  RETURN COALESCE(v_admin, false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_write()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT p.descricao FROM public.usuarios u JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id WHERE u.id = auth.uid()) IN ('Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor');
END;
$function$;
