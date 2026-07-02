import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Plane } from 'lucide-react';
import { HangarGrid } from '../HangarGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tu Hangar - Metaltools",
  description: "Gestiona los niveles y habilidades de tus aviones."
};

export default async function HangarPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const currentUserRole = profile?.role || 'PILOT';

  // Fetch all airplanes
  const { data: airplanes } = await supabase
    .from('airplanes')
    .select('*')
    .order('name');

  // Fetch pilot's owned airplanes
  const { data: pilotAirplanes } = await supabase
    .from('pilot_airplanes')
    .select('*')
    .eq('profile_id', user.id);

  // Fetch tactical images
  const { data: tacticalImages } = await supabase
    .from('airplane_tactical_images')
    .select(`
      id,
      airplane_id,
      image_url,
      game_modes,
      comment,
      uploader_id,
      created_at,
      profiles!uploader_id ( username )
    `);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-6 h-6 text-[var(--color-gaming-secondary)]" />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Tu Hangar</h2>
      </div>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Selecciona los aviones que tienes desbloqueados en el juego y ajusta su nivel actual, habilidad especial y pasiva. 
        Tus cambios se guardarán automáticamente en la base de datos de tu escuadrón.
      </p>

      {(!airplanes || airplanes.length === 0) ? (
        <div className="glass-panel p-8 rounded-3xl border border-yellow-500/20 shadow-[0_0_50px_rgba(255,200,0,0.05)] text-center">
          <h3 className="text-xl font-bold text-yellow-500 mb-2">Base de datos de aviones vacía</h3>
          <p className="text-gray-400">
            Parece que aún no has ejecutado el script SQL para cargar los aviones. Por favor, corre el archivo `planes_seed.sql` en tu panel de Supabase.
          </p>
        </div>
      ) : (
        <HangarGrid 
          airplanes={airplanes || []} 
          pilotAirplanes={pilotAirplanes || []} 
          currentUserRole={currentUserRole}
          currentUserId={user.id}
          tacticalImages={tacticalImages || []}
        />
      )}
    </div>
  );
}
