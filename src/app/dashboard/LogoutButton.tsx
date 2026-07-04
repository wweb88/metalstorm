'use client';

import { useTransition } from 'react';
import { logout } from '@/app/login/actions';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-bold uppercase text-sm transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {isPending ? 'Saliendo...' : 'Salir'}
    </button>
  );
}
