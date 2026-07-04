'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createSquadron(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  
  if (!name) return { error: 'El nombre es requerido' }

  const { error } = await supabase
    .from('squadrons')
    .insert({ name })

  if (error) {
    return { error: 'Error al crear escuadrón: ' + error.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: true }
}

export async function deleteSquadron(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('squadrons')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Error al borrar: ' + error.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: true }
}

export async function assignPilotToSquadron(profileId: string, squadronId: string | null) {
  const supabase = await createClient()

  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permisos para esto' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ squadron_id: squadronId })
    .eq('id', profileId)

  if (error) {
    return { error: 'Error al asignar piloto: ' + error.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: true }
}

export async function adminCreatePilot(formData: FormData) {
  // 1. Verify caller has permission
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permiso para crear pilotos' }
  }

  // 2. Extract data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const squadronId = formData.get('squadron_id') as string

  if (!email || !password || !username) {
    return { error: 'Email, Contraseña y Username son obligatorios' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  // 3. Create user using Admin API (does not log out current user)
  const adminClient = createAdminClient()
  
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm the email
  })

  if (authError) {
    return { error: 'Error al crear la cuenta: ' + authError.message }
  }

  if (!authData.user) {
    return { error: 'Usuario creado pero no se devolvió el ID' }
  }

  // 4. Update the profile trigger that was just created
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      username: username,
      squadron_id: squadronId === 'none' ? null : squadronId
    })
    .eq('id', authData.user.id)

  if (profileError) {
    return { error: 'Cuenta creada pero falló al asignar escuadrón/nombre: ' + profileError.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: 'Piloto creado y asignado con éxito' }
}

export async function editSquadron(id: string, newName: string) {
  const supabase = await createClient()
  
  if (!newName) return { error: 'El nombre no puede estar vacío' }

  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permisos para esto' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('squadrons')
    .update({ name: newName })
    .eq('id', id)

  if (error) {
    return { error: 'Error al editar: ' + error.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: true }
}

export async function togglePilotStatus(profileId: string, isActive: boolean) {
  const supabase = await createClient()
  
  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permisos para esto' }
  }
  
  // Bypass RLS for the update to ensure it succeeds
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', profileId)

  if (error) {
    return { error: 'Error al cambiar estado: ' + error.message }
  }

  revalidatePath('/dashboard/squadrons')
  return { success: true }
}
export async function updatePilotRole(profileId: string, newRole: string) {
  const supabase = await createClient()

  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permisos para cambiar rangos' }
  }

  // Validate allowed roles based on caller
  if (callerProfile.role === 'ADMIN') {
    if (newRole !== 'STAFF' && newRole !== 'PILOT') {
      return { error: 'Como ADMIN, solo puedes asignar los roles STAFF o PILOT' }
    }
    
    // Check target's current role
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', profileId)
      .single()
      
    if (targetProfile?.role === 'SUPER_ADMIN' || targetProfile?.role === 'ADMIN') {
      return { error: 'No puedes modificar el rol de un superior o igual' }
    }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', profileId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/squadrons')
  return { success: true }
}

export async function adminResetPassword(profileId: string, newPassword: string) {
  const supabase = await createClient()

  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
    return { error: 'No tienes permisos para resetear contraseñas' }
  }

  if (newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(profileId, {
    password: newPassword
  })

  if (error) return { error: error.message }

  return { success: true }
}
