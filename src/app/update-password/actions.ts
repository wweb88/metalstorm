'use server';

import { createClient } from '@/utils/supabase/server';

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error('Error updating password:', error);
    return { error: 'No se pudo actualizar la contraseña. Asegúrate de que el enlace no haya expirado.' };
  }

  return { success: true };
}
