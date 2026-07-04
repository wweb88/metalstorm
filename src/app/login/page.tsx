'use client';

import { useState } from 'react';
import { login } from './actions';
import { Shield, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00b3cc] text-black font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
      {pending ? 'Iniciando...' : 'Iniciar Sesión'}
    </button>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-[var(--color-gaming-accent)]/20 shadow-[0_0_50px_rgba(0,229,255,0.1)] relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[var(--color-gaming-accent)] opacity-5 blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center mb-8">
            <div className="bg-[var(--color-gaming-accent)]/20 p-4 rounded-full border border-[var(--color-gaming-accent)]/50 shadow-[0_0_30px_rgba(0,229,255,0.3)] mb-4">
              <Shield className="w-10 h-10 text-[var(--color-gaming-accent)]" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
              Acceso Piloto
            </h1>
            <p className="text-[var(--color-gaming-accent)] font-bold tracking-[0.2em] uppercase text-xs mt-2">
              Base de Datos Privada
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{message}</p>
            </div>
          )}

          <form action={login} className="space-y-4">


            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-black/60 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
                  placeholder="piloto@escuadron.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña de Enlace</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full bg-black/60 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs font-bold text-[var(--color-gaming-accent)] hover:text-white uppercase tracking-wider transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <SubmitButton />
          </form>


        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-gaming-accent)]"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
