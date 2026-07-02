import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '../login/actions';
import { LogOut, User, Settings, Shield, Plane } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, is_active')
    .eq('id', user.id)
    .single();

  if (profile && profile.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4 text-center">
        <div className="glass-panel max-w-md p-8 rounded-3xl border border-red-500/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-transparent"></div>
          <div className="flex justify-center">
            <Shield className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Cuenta Suspendida</h1>
          <p className="text-gray-400">
            Tu acceso a la plataforma ha sido revocado. Por favor, contacta a un administrador de tu escuadrón si crees que esto es un error.
          </p>
          <form action={logout}>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase tracking-wider text-white transition-colors w-full">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isLeader = profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN' || profile?.role === 'STAFF';

  return (
    <div className="w-full max-w-[1800px] mx-auto p-4 md:p-8 space-y-8 py-12">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-black/40 border border-white/10 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--color-gaming-accent)]/20 p-3 rounded-xl border border-[var(--color-gaming-accent)]/50">
            <User className="w-8 h-8 text-[var(--color-gaming-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-white">
              Bienvenido, <span className="text-[var(--color-gaming-accent)]">{profile?.username || 'Piloto'}</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">
              Rango: <span className="text-white">{profile?.role || 'PILOT'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/squadrons" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gaming-secondary)]/10 hover:bg-[var(--color-gaming-secondary)]/20 border border-[var(--color-gaming-secondary)]/30 text-[var(--color-gaming-secondary)] rounded-lg font-bold uppercase text-sm transition-colors">
            <Shield className="w-4 h-4" />
            Gestión
          </Link>
          
          <Link href="/dashboard/hangar" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold uppercase text-sm transition-colors">
            <Plane className="w-4 h-4" />
            Hangar
          </Link>
          
          <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold uppercase text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Perfil
          </Link>
          
          <form action={logout}>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-bold uppercase text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}
