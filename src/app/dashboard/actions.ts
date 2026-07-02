'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function togglePlane(airplaneId: string, isUnlocked: boolean, targetProfileId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  let profileIdToUpdate = user.id;

  // If trying to update someone else's profile, check admin permissions
  if (targetProfileId && targetProfileId !== user.id) {
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
      return { error: 'No tienes permisos para editar el hangar de otro piloto' }
    }
    
    profileIdToUpdate = targetProfileId;
  }

  // Use admin client to bypass RLS for pilot_airplanes mutations
  const adminClient = createAdminClient();

  if (isUnlocked) {
    // Upsert a new record unlocking the plane with level 1 by default
    const { error } = await adminClient
      .from('pilot_airplanes')
      .upsert({
        profile_id: profileIdToUpdate,
        airplane_id: airplaneId,
        is_unlocked: true,
        level: 1,
        special_ability_level: 0,
        passive_ability_level: 0
      }, { onConflict: 'profile_id, airplane_id' })
      
    if (error) console.error('Error unlocking plane:', error)
  } else {
    // Delete the record if they lock it back
    const { error } = await adminClient
      .from('pilot_airplanes')
      .delete()
      .eq('profile_id', profileIdToUpdate)
      .eq('airplane_id', airplaneId)
      
    if (error) console.error('Error locking plane:', error)
  }

  revalidatePath('/dashboard')
}

export async function updatePlaneLevel(
  airplaneId: string, 
  field: 'level' | 'special_ability_level' | 'passive_ability_level' | 'mod1_name' | 'mod1_level' | 'mod2_name' | 'mod2_level', 
  value: number | string | null, 
  targetProfileId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  let profileIdToUpdate = user.id;

  // If trying to update someone else's profile, check admin permissions
  if (targetProfileId && targetProfileId !== user.id) {
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'SUPER_ADMIN' && callerProfile?.role !== 'ADMIN') {
      return { error: 'No tienes permisos' }
    }
    
    profileIdToUpdate = targetProfileId;
  }

  // Use admin client to bypass RLS for mutations
  const adminClient = createAdminClient();

  const updateData: any = { [field]: value };
  
  if (field === 'level' && typeof value === 'number') {
    if (value < 20) {
      updateData.mod2_name = null;
      updateData.mod2_level = null;
    }
    if (value < 16) {
      updateData.mod1_name = null;
      updateData.mod1_level = null;
    }
    if (value < 12) {
      updateData.passive_ability_level = 0;
    }
    if (value < 8) {
      updateData.special_ability_level = 0;
    }
  }

  const { error } = await adminClient
    .from('pilot_airplanes')
    .update(updateData)
    .eq('profile_id', profileIdToUpdate)
    .eq('airplane_id', airplaneId)

  if (error) console.error(`Error updating ${field}:`, error)

  revalidatePath('/dashboard')
}

export async function uploadTacticalImage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!callerProfile || callerProfile.role === 'PILOT') {
    return { error: 'No tienes permisos para subir imágenes' };
  }

  const airplaneId = formData.get('airplaneId') as string;
  const image = formData.get('image') as File;
  const gameModesStr = formData.get('gameModes') as string;
  const comment = formData.get('comment') as string;
  
  if (!airplaneId || !image || !gameModesStr) {
    return { error: 'Faltan datos obligatorios' };
  }

  const gameModes = JSON.parse(gameModesStr);
  const fileExt = image.name.split('.').pop();
  const fileName = `${airplaneId}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('tactical-images')
    .upload(fileName, image, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return { error: 'Error al subir la imagen' };
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('tactical-images')
    .getPublicUrl(fileName);

  // Insert into DB
  const { error: dbError } = await supabase
    .from('airplane_tactical_images')
    .insert({
      airplane_id: airplaneId,
      uploader_id: user.id,
      image_url: publicUrlData.publicUrl,
      game_modes: gameModes,
      comment: comment || null
    });

  if (dbError) {
    console.error('Error inserting tactical image record:', dbError);
    return { error: 'Error al guardar el registro' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTacticalImage(imageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: currentImage } = await supabase
    .from('airplane_tactical_images')
    .select('uploader_id')
    .eq('id', imageId)
    .single();

  if (!currentImage) return { error: 'Imagen no encontrada' };

  // Allow if uploader or ADMIN/SUPER_ADMIN
  const isUploader = currentImage.uploader_id === user.id;
  const isAdmin = callerProfile?.role === 'ADMIN' || callerProfile?.role === 'SUPER_ADMIN';

  if (!isUploader && !isAdmin) {
    return { error: 'No tienes permisos para editar esta imagen' };
  }

  const gameModesStr = formData.get('gameModes') as string;
  const comment = formData.get('comment') as string;

  if (!gameModesStr) {
    return { error: 'Faltan modos de juego' };
  }

  const gameModes = JSON.parse(gameModesStr);

  const { error: updateError } = await supabase
    .from('airplane_tactical_images')
    .update({
      game_modes: gameModes,
      comment: comment || null
    })
    .eq('id', imageId);

  if (updateError) {
    console.error('Error updating tactical image:', updateError);
    return { error: 'Error al actualizar' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteTacticalImage(imageId: string, imageUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'ADMIN' && callerProfile?.role !== 'SUPER_ADMIN') {
    return { error: 'No tienes permisos para eliminar esta imagen' };
  }

  // Borrar primero del Storage
  // La URL es algo como: https://xyz.supabase.co/storage/v1/object/public/tactical-images/airplaneId/timestamp.png
  // El path para eliminar es 'airplaneId/timestamp.png'
  try {
    const urlParts = imageUrl.split('/tactical-images/');
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      await supabase.storage.from('tactical-images').remove([filePath]);
    }
  } catch (err) {
    console.error('Error removing file from storage', err);
    // Continuamos para eliminar el registro de la DB de todas formas
  }

  const { error: deleteError } = await supabase
    .from('airplane_tactical_images')
    .delete()
    .eq('id', imageId);

  if (deleteError) {
    console.error('Error deleting tactical image:', deleteError);
    return { error: 'Error al eliminar el registro' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

