'use client';

import { useState, useTransition } from 'react';
import { updatePassword } from './actions';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    startTransition(async () => {
      const res = await updatePassword(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050508]">
      {/* Elementos de fondo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gaming-accent)] to-transparent opacity-20"></div>
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-6 bg-[var(--color-gaming-accent)]/10 rounded-2xl flex items-center justify-center border border-[var(--color-gaming-accent)]/30 shadow-[0_0_30px_rgba(var(--color-gaming-accent-rgb),0.2)]">
            <Shield className="w-10 h-10 text-[var(--color-gaming-accent)]" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-wider uppercase text-center">
            Actualizar Clave
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm uppercase tracking-widest font-bold">
            Portal de Seguridad Metalstorm
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
          {success ? (
            <div className="text-center space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Clave Actualizada</h3>
                <p className="text-sm opacity-80">
                  Tu contraseña ha sido restablecida exitosamente. Ahora puedes continuar al hangar.
                </p>
              </div>
              <Link href="/dashboard/hangar" className="inline-flex items-center justify-center gap-2 w-full bg-[var(--color-gaming-accent)] text-black py-4 rounded-xl font-black uppercase tracking-widest transition-colors hover:bg-[var(--color-gaming-accent-hover)]">
                Ir al Hangar <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6 text-center">
                Ingresa tu nueva contraseña para tu cuenta de piloto.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)] transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)] transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-xl border border-red-500/20 flex items-center justify-center font-bold text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[var(--color-gaming-accent)] hover:bg-[var(--color-gaming-accent-hover)] text-black font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--color-gaming-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-gaming-accent-rgb),0.5)] flex items-center justify-center gap-2 mt-8"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Actualizar
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
