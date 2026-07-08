'use client';

import { useState, useTransition } from 'react';
import { createSquadron, deleteSquadron, assignPilotToSquadron, adminCreatePilot, editSquadron, togglePilotStatus, updatePilotRole, adminResetPassword } from './actions';
import { Shield, Users, Trash2, Plus, Loader2, UserPlus, UserCircle, Edit2, Check, X, UserMinus, UserCheck, AlertTriangle, Plane, ShieldCheck, Key } from 'lucide-react';
import { HangarGrid } from '../HangarGrid';
import { SquadBuilderDB } from './SquadBuilderDB';

type Airplane = {
  id: string;
  name: string;
  sub_name: string | null;
  class: string;
  image_url: string;
};

type SquadronData = {
  id: string;
  name: string;
  pilots: { id: string; username: string; role: string; is_active?: boolean }[];
};

type ProfileData = {
  id: string;
  username: string;
  role: string;
  squadron_id: string | null;
  is_active?: boolean;
  activePlanesCount?: number;
  totalTrophies?: number;
  pilotAirplanes?: any[];
};

export function SquadronsClient({ 
  squadrons, 
  allProfiles,
  airplanes,
  currentUserRole,
  currentUserId,
  tacticalImages = []
}: { 
  squadrons: SquadronData[],
  allProfiles: ProfileData[],
  airplanes: Airplane[],
  currentUserRole: string,
  currentUserId: string,
  tacticalImages?: any[]
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'SQUADRONS' | 'PILOTS' | 'CREATE_PILOT' | 'SQUAD_BUILDER'>(
    currentUserRole === 'PILOT' ? 'SQUAD_BUILDER' : 'SQUADRONS'
  );
  
  // Estado para la edición inline del nombre de escuadrón
  const [editingSquadronId, setEditingSquadronId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Estado para filtrar la vista de pilotos por escuadrón
  const [selectedSquadronFilter, setSelectedSquadronFilter] = useState<string | 'ALL'>('ALL');

  // Estado para el Modal de Confirmación
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Estado para el Modal de Reset Password
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    profileId: string | null;
    username: string;
    newPassword: '';
  }>({
    isOpen: false,
    profileId: null,
    username: '',
    newPassword: '',
  });

  // Estado para el Modal de Hangar
  const [viewingHangarFor, setViewingHangarFor] = useState<ProfileData | null>(null);

  const getRoleColors = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return 'text-yellow-400 bg-yellow-400/10';
      case 'ADMIN': return 'text-orange-400 bg-orange-400/10';
      case 'STAFF': return 'text-purple-400 bg-purple-400/10';
      case 'PILOT': return 'text-[var(--color-gaming-accent)] bg-[var(--color-gaming-accent)]/10';
      default: return 'text-gray-400 bg-white/10';
    }
  };

  const getRoleTextColor = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return 'text-yellow-400';
      case 'ADMIN': return 'text-orange-400';
      case 'STAFF': return 'text-purple-400';
      case 'PILOT': return 'text-[var(--color-gaming-accent)]';
      default: return 'text-gray-400';
    }
  };

  const canManageSquadrons = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN';
  const canDeleteSquadrons = currentUserRole === 'SUPER_ADMIN';

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const res = await createSquadron(formData);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset();
      }
    });
  };

  const handleDelete = (id: string) => {
    openConfirm(
      'Borrar Escuadrón',
      '¿Seguro que quieres borrar este escuadrón de forma permanente? Todos sus pilotos quedarán sin escuadrón.',
      () => {
        startTransition(async () => {
          const res = await deleteSquadron(id);
          if (res.error) setError(res.error);
        });
      }
    );
  };

  const handleAssign = (profileId: string, squadronId: string) => {
    startTransition(async () => {
      const res = await assignPilotToSquadron(profileId, squadronId === 'none' ? null : squadronId);
      if (res.error) setError(res.error);
    });
  };

  const handleCreatePilot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const res = await adminCreatePilot(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccessMsg(res.success);
        form.reset();
      }
    });
  };

  const startEditing = (sq: SquadronData) => {
    setEditingSquadronId(sq.id);
    setEditingName(sq.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    startTransition(async () => {
      const res = await editSquadron(id, editingName);
      if (res.error) {
        setError(res.error);
      } else {
        setEditingSquadronId(null);
      }
    });
  };

  const handleToggleStatus = (profileId: string, currentStatus: boolean) => {
    const actionName = currentStatus ? "dar de baja a" : "reactivar a";
    openConfirm(
      currentStatus ? 'Suspender Piloto' : 'Reactivar Piloto',
      `¿Seguro que quieres ${actionName} este piloto?`,
      () => {
        startTransition(async () => {
          const res = await togglePilotStatus(profileId, !currentStatus);
          if (res.error) setError(res.error);
        });
      }
    );
  };

  const handleRoleChange = (profileId: string, newRole: string) => {
    startTransition(async () => {
      const res = await updatePilotRole(profileId, newRole);
      if (res.error) setError(res.error);
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModal.profileId || !resetPasswordModal.newPassword) return;

    startTransition(async () => {
      const res = await adminResetPassword(resetPasswordModal.profileId!, resetPasswordModal.newPassword);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(`Contraseña de ${resetPasswordModal.username} restablecida con éxito.`);
        setResetPasswordModal({ isOpen: false, profileId: null, username: '', newPassword: '' });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Tabs de Navegación Interna */}
      <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
        {currentUserRole !== 'PILOT' && (
          <>
            <button 
              onClick={() => { setActiveTab('SQUADRONS'); setError(''); setSuccessMsg(''); }}
              className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider transition-all ${
                activeTab === 'SQUADRONS' ? 'bg-[var(--color-gaming-secondary)] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Ver Escuadrones
            </button>
            <button 
              onClick={() => { setActiveTab('PILOTS'); setError(''); setSuccessMsg(''); }}
              className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'PILOTS' ? 'bg-[var(--color-gaming-accent)] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Pilotos
            </button>
          </>
        )}
        <button 
          onClick={() => { setActiveTab('SQUAD_BUILDER'); setError(''); setSuccessMsg(''); }}
          className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'SQUAD_BUILDER' ? 'bg-blue-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Armar Escuadrón
        </button>
        {canManageSquadrons && (
          <button 
            onClick={() => { setActiveTab('CREATE_PILOT'); setError(''); setSuccessMsg(''); }}
            className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'CREATE_PILOT' ? 'bg-purple-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCircle className="w-4 h-4" /> Crear Piloto
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-bold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 text-green-400 p-4 rounded-xl border border-green-500/20 font-bold">
          {successMsg}
        </div>
      )}

      {activeTab === 'SQUADRONS' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Formulario de creación (Solo Admins) */}
          {canManageSquadrons && (
            <form onSubmit={handleCreate} className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nuevo Escuadrón</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ej: Alpha Squadron" 
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
                />
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex items-center gap-2 bg-[var(--color-gaming-accent)] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[var(--color-gaming-accent-hover)] transition-all w-full sm:w-auto justify-center"
              >
                {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                Crear
              </button>
            </form>
          )}

          {/* Lista de Escuadrones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {squadrons.map((sq) => (
              <div 
                key={sq.id} 
                onClick={() => { setActiveTab('PILOTS'); setSelectedSquadronFilter(sq.id); }}
                className="glass-panel border border-white/10 rounded-2xl p-6 relative group overflow-hidden flex flex-col h-full cursor-pointer hover:border-[var(--color-gaming-accent)] transition-all hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-gaming-accent)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4 gap-2">
                  {editingSquadronId === sq.id ? (
                    <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="w-full bg-black/80 border border-[var(--color-gaming-accent)] rounded px-2 py-1 text-white font-bold"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(sq.id)} disabled={isPending} className="text-green-400 hover:text-green-300">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingSquadronId(null)} disabled={isPending} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-black text-white uppercase tracking-wider truncate flex-1 group-hover:text-[var(--color-gaming-accent)] transition-colors" title={sq.name}>
                        {sq.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {canManageSquadrons && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEditing(sq); }}
                            disabled={isPending}
                            className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-lg hover:bg-white/10"
                            title="Editar Nombre"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteSquadrons && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(sq.id); }}
                            disabled={isPending}
                            className="text-gray-500 hover:text-red-500 transition-colors p-2 bg-white/5 rounded-lg hover:bg-red-500/10"
                            title="Borrar Escuadrón"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[var(--color-gaming-secondary)] mb-4">
                  <Users className="w-5 h-5" />
                  <span className="font-bold">
                    {sq.pilots.filter(p => p.is_active !== false).length} Piloto{sq.pilots.filter(p => p.is_active !== false).length !== 1 ? 's' : ''} Activo{sq.pilots.filter(p => p.is_active !== false).length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between text-sm border-t border-white/5">
                  <span className="text-gray-500 font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                    Ver Detalles
                  </span>
                  <span className="text-gray-600 group-hover:text-[var(--color-gaming-accent)] transition-colors">
                    &rarr;
                  </span>
                </div>
              </div>
            ))}

            {squadrons.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
                Aún no hay escuadrones creados
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PILOTS' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-black/40 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider">Asignación de Escuadrones</h3>
              <p className="text-gray-400 text-sm">Selecciona a qué escuadrón pertenece cada piloto o gestiona sus permisos.</p>
            </div>
            {/* Filtro por escuadrón */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtrar:</span>
              <select 
                value={selectedSquadronFilter}
                onChange={(e) => setSelectedSquadronFilter(e.target.value)}
                className="bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-gaming-accent)] outline-none min-w-[200px]"
              >
                <option value="ALL">TODOS LOS PILOTOS</option>
                {squadrons.map(sq => (
                  <option key={sq.id} value={sq.id}>{sq.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">#</th>
                  <th className="px-6 py-4">Piloto (Username)</th>
                  <th className="px-6 py-4">Rango</th>
                  <th className="px-6 py-4">Aviones</th>
                  <th className="px-6 py-4">Trofeos</th>
                  <th className="px-6 py-4">Escuadrón</th>
                  {canManageSquadrons && <th className="px-6 py-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allProfiles
                  .filter(p => selectedSquadronFilter === 'ALL' || p.squadron_id === selectedSquadronFilter)
                  .sort((a, b) => {
                    const aActive = a.is_active !== false;
                    const bActive = b.is_active !== false;
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;
                    return a.username.localeCompare(b.username);
                  })
                  .map((profile, index) => {
                  const isSuspended = profile.is_active === false;
                  return (
                    <tr key={profile.id} className={`hover:bg-white/5 transition-colors ${isSuspended ? 'bg-red-900/10 opacity-70' : ''}`}>
                      <td className="px-6 py-4 text-center text-gray-500 font-black">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isSuspended ? 'text-red-400 line-through' : 'text-white'}`}>{profile.username}</span>
                          {isSuspended && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Suspendido</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {canManageSquadrons && (currentUserRole === 'SUPER_ADMIN' || (currentUserRole === 'ADMIN' && profile.role !== 'SUPER_ADMIN' && profile.role !== 'ADMIN')) ? (
                          <select
                            disabled={isPending || isSuspended}
                            value={profile.role}
                            onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                            className={`bg-black border border-white/20 rounded-lg px-2 py-1 text-xs font-bold uppercase focus:border-white outline-none disabled:opacity-50 ${getRoleTextColor(profile.role)}`}
                          >
                            {currentUserRole === 'SUPER_ADMIN' && (
                              <>
                                <option value="SUPER_ADMIN" className="text-yellow-400">SUPER_ADMIN</option>
                                <option value="ADMIN" className="text-orange-400">ADMIN</option>
                              </>
                            )}
                            <option value="STAFF" className="text-purple-400">STAFF</option>
                            <option value="PILOT" className="text-[var(--color-gaming-accent)]">PILOT</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getRoleColors(profile.role)}`}>
                            {profile.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingHangarFor(profile)}
                          className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gaming-accent)] hover:text-black transition-colors"
                          title="Ver Hangar"
                        >
                          {profile.activePlanesCount || 0}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src="/assets/images/Trophy-icon.webp" alt="Trophy" className="w-4 h-4 object-contain" />
                          <span className="text-yellow-500 font-bold tracking-wider">
                            {(profile.totalTrophies || 0).toLocaleString('es-ES')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {canManageSquadrons ? (
                          <select
                            disabled={isPending || isSuspended}
                            value={profile.squadron_id || 'none'}
                            onChange={(e) => handleAssign(profile.id, e.target.value)}
                            className={`bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-gaming-accent)] outline-none w-full max-w-[200px] disabled:opacity-50`}
                          >
                            <option value="none">-- Sin Escuadrón --</option>
                            {squadrons.map(sq => (
                              <option key={sq.id} value={sq.id}>{sq.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-300 font-bold">
                            {profile.squadron_id ? squadrons.find(s => s.id === profile.squadron_id)?.name || 'Desconocido' : 'Sin Escuadrón'}
                          </span>
                        )}
                      </td>
                      {canManageSquadrons && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col gap-2 justify-end items-end">
                            <button
                              onClick={() => handleToggleStatus(profile.id, !isSuspended)}
                              disabled={isPending}
                              className={`p-2 rounded-lg transition-colors font-bold flex items-center justify-center gap-2 w-full max-w-[140px] border
                                ${isSuspended 
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
                              title={isSuspended ? 'Reactivar' : 'Dar de baja'}
                            >
                              {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                              <span className="text-xs uppercase tracking-widest">{isSuspended ? 'Reactivar' : 'Suspender'}</span>
                            </button>
                            
                            <button
                              onClick={() => setResetPasswordModal({ isOpen: true, profileId: profile.id, username: profile.username, newPassword: '' })}
                              disabled={isPending}
                              className="p-2 rounded-lg transition-colors font-bold flex items-center justify-center gap-2 w-full max-w-[140px] border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                              title="Resetear Clave"
                            >
                              <Key className="w-4 h-4" />
                              <span className="text-xs uppercase tracking-widest">Clave</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                
                {allProfiles.filter(p => selectedSquadronFilter === 'ALL' || p.squadron_id === selectedSquadronFilter).length === 0 && (
                  <tr>
                    <td colSpan={canManageSquadrons ? 5 : 4} className="px-6 py-8 text-center text-gray-500 font-bold uppercase tracking-widest">
                      {selectedSquadronFilter === 'ALL' 
                        ? 'No hay perfiles registrados' 
                        : 'No hay pilotos en este escuadrón'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CREATE_PILOT' && canManageSquadrons && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <form onSubmit={handleCreatePilot} className="bg-black/40 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mb-4">
                <UserCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white tracking-wider">Registrar Piloto</h3>
              <p className="text-gray-400 mt-2">Crea una cuenta nueva para un piloto y asígnale su escuadrón.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                type="email" 
                name="email"
                placeholder="piloto@escuadron.com"
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nombre de Piloto</label>
                <input 
                  type="text" 
                  name="username"
                  placeholder="Ej: Maverick"
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contraseña Temporal</label>
                <input 
                  type="text" 
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Escuadrón Inicial</label>
              <select
                name="squadron_id"
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="none">-- Sin Escuadrón --</option>
                {squadrons.map(sq => (
                  <option key={sq.id} value={sq.id}>{sq.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 bg-purple-500 text-black px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-purple-400 transition-all disabled:opacity-50 mt-8"
            >
              {isPending ? <Loader2 className="animate-spin w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              Crear Cuenta de Piloto
            </button>
          </form>
        </div>
      )}

      {activeTab === 'SQUAD_BUILDER' && (
        <SquadBuilderDB 
          squadrons={squadrons} 
          allProfiles={allProfiles} 
          airplanes={airplanes} 
        />
      )}

      {/* Modal de Confirmación Personalizado */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeConfirm}></div>
          <div className="bg-[#151a2d] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-gaming-secondary)]"></div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider leading-none">
                {confirmModal.title}
              </h3>
            </div>
            
            <p className="text-gray-400 mb-8 font-semibold">
              {confirmModal.message}
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeConfirm}
                className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-colors uppercase text-sm tracking-wider"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirm();
                }}
                className="px-6 py-3 bg-[var(--color-gaming-secondary)] text-white rounded-xl font-bold hover:bg-red-500 transition-colors uppercase text-sm tracking-wider"
              >
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Hangar */}
      {viewingHangarFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingHangarFor(null)}></div>
          
          <div className="relative bg-[#151a2d] border border-[var(--color-gaming-accent)]/20 rounded-3xl w-full max-w-7xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-gaming-accent)] to-transparent"></div>
            
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/40 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--color-gaming-accent)]/20 rounded-xl text-[var(--color-gaming-accent)]">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">Hangar de {viewingHangarFor.username}</h3>
                  <p className={`font-bold tracking-widest text-xs uppercase ${getRoleTextColor(viewingHangarFor.role)}`}>{viewingHangarFor.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingHangarFor(null)}
                className="p-2 sm:p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <HangarGrid 
                airplanes={airplanes} 
                pilotAirplanes={viewingHangarFor.pilotAirplanes || []} 
                readOnly={!canManageSquadrons}
                targetProfileId={viewingHangarFor.id}
                tacticalImages={tacticalImages}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#050508] border border-white/20 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider">{confirmModal.title}</h3>
            <p className="text-gray-400 mb-8">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirm();
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#050508] border border-[var(--color-gaming-accent)]/30 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_30px_rgba(var(--color-gaming-accent-rgb),0.2)]">
            <h3 className="text-xl font-black mb-2 uppercase tracking-wider text-white">Resetear Clave</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Asignar una nueva contraseña para <strong className="text-[var(--color-gaming-accent)]">{resetPasswordModal.username}</strong>
            </p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nueva Contraseña</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={resetPasswordModal.newPassword}
                  onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, newPassword: e.target.value as any })}
                  className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
                  placeholder="ej: 123456"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setResetPasswordModal({ isOpen: false, profileId: null, username: '', newPassword: '' })}
                  disabled={isPending}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-3 bg-[var(--color-gaming-accent)] text-black rounded-xl font-black uppercase tracking-wider hover:bg-[var(--color-gaming-accent-hover)] transition-colors shadow-[0_0_20px_rgba(var(--color-gaming-accent-rgb),0.3)] flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
