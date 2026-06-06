import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authorization required')

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: isAdmin, error: rpcError } = await userClient.rpc('is_gestor')
    if (rpcError) throw new Error('Authorization error: ' + rpcError.message)
    if (!isAdmin) {
      throw new Error('Forbidden: Only administrators can invite users')
    }

    const { email, name, role } = await req.json()
    if (!email || !name || !role) {
      throw new Error('Missing required fields')
    }

    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name },
      })

    if (inviteError) throw inviteError

    const newUserId = inviteData.user.id

    const { data: roleData } = await supabaseAdmin
      .from('perfil_acesso')
      .select('id')
      .ilike('descricao', role)
      .single()

    if (roleData) {
      const { error: updateError } = await supabaseAdmin
        .from('usuarios')
        .update({
          perfil_acesso_id: roleData.id,
          nome: name,
        })
        .eq('id', newUserId)

      if (updateError) {
        console.error('Failed to update user profile:', updateError)
      }
    }

    return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
