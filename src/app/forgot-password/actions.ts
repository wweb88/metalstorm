'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'El correo electrónico es requerido' };
  }

  const supabase = await createClient();
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    console.error('Error requesting password reset:', error);
    return { error: 'No se pudo enviar el correo de recuperación. Verifica que la dirección sea correcta.' };
  }

  return { success: true };
}
