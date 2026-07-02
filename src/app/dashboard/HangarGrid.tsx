'use client';

import { useState, useTransition } from 'react';
import { togglePlane, updatePlaneLevel } from './actions';
import { cn } from '@/lib/utils';
import { Lock, Unlock, ShieldAlert, Zap, Cpu, Loader2, Filter, SearchX, Wrench, ImagePlus, Images } from 'lucide-react';
import { TacticalImageModal } from './TacticalImageModal';
import { TacticalGalleryModal, TacticalImage } from './TacticalGalleryModal';

type Airplane = {
  id: string;
  name: string;
  sub_name: string | null;
  class: string;
  image_url: string;
};

type PilotAirplane = {
  airplane_id: string;
  is_unlocked: boolean;
  level: number;
  special_ability_level: number;
  passive_ability_level: number;
  mod1_name: string | null;
  mod1_level: number | null;
  mod2_name: string | null;
  mod2_level: number | null;
};

const MODIFIERS = [
  { name: 'Bengalas más rápidas', image: '/assets/images/mods/Faster-flares-crafted.webp' },
  { name: 'Bengalas distruptivas', image: '/assets/images/mods/Disruptive-flares-crafted.webp' },
  { name: 'Giro temerario', image: '/assets/images/mods/Daredevil-turning-crafted.webp' },
  { name: 'Guiado mejorado', image: '/assets/images/mods/Improved-targeting-crafted.webp' },
  { name: 'Maniobrabilidad ideal', image: '/assets/images/mods/Ideal-maneuvering-crafted.webp' },
  { name: 'Quemadores auxiliares eficientes', image: '/assets/images/mods/Efficient-afterburners-crafted.webp' },
  { name: 'Blindaje de ataque', image: '/assets/images/mods/Streak-armor-crafted.webp' },
  { name: 'Máxima propulsión', image: '/assets/images/mods/Thrust-booster-crafted.webp' },
  { name: 'Armas aniquiladoras', image: '/assets/images/mods/Finishing-guns-crafted.webp' },
  { name: 'Resistencia a las explosiones', image: '/assets/images/mods/Blast-resistance-crafted.webp' }
];

interface HangarGridProps {
  airplanes: Airplane[];
  pilotAirplanes: PilotAirplane[];
  readOnly?: boolean;
  targetProfileId?: string;
  currentUserRole?: string;
  currentUserId?: string;
  tacticalImages?: TacticalImage[];
}

export function HangarGrid({ airplanes, pilotAirplanes, readOnly = false, targetProfileId, currentUserRole = 'PILOT', currentUserId, tacticalImages = [] }: HangarGridProps) {
  const [isPending, startTransition] = useTransition();
  const [loadingPlaneId, setLoadingPlaneId] = useState<string | null>(null);
  const [uploadingForPlane, setUploadingForPlane] = useState<Airplane | null>(null);
  const [viewingGalleryForPlane, setViewingGalleryForPlane] = useState<Airplane | null>(null);

  // Crear un mapa para acceso rápido
  const pilotPlanesMap = new Map<string, PilotAirplane>(
    pilotAirplanes.map(p => [p.airplane_id, p])
  );

  const handleToggle = (airplaneId: string, currentlyUnlocked: boolean) => {
    if (readOnly) return;
    setLoadingPlaneId(airplaneId);
    startTransition(() => {
      togglePlane(airplaneId, !currentlyUnlocked, targetProfileId);
    });
  };

  const handleLevelChange = (airplaneId: string, field: 'level' | 'special_ability_level' | 'passive_ability_level' | 'mod1_name' | 'mod1_level' | 'mod2_name' | 'mod2_level', value: number | string | null) => {
    if (readOnly) return;
    setLoadingPlaneId(airplaneId);
    startTransition(() => {
      updatePlaneLevel(airplaneId, field, value, targetProfileId);
    });
  };

  const sortedAirplanes = [...airplanes].sort((a, b) => {
    const aData = pilotPlanesMap.get(a.id);
    const bData = pilotPlanesMap.get(b.id);
    const aUnlocked = aData?.is_unlocked || false;
    const bUnlocked = bData?.is_unlocked || false;
    
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    if (aUnlocked && bUnlocked) {
      const aLevel = aData?.level || 1;
      const bLevel = bData?.level || 1;
      if (aLevel !== bLevel) {
        return bLevel - aLevel;
      }
    }
    
    return a.name.localeCompare(b.name);
  });

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredAirplanes = sortedAirplanes.filter(plane => {
    if (filterType !== 'ALL' && plane.class !== filterType) return false;
    
    if (filterLevel !== 'ALL') {
      const ownedData = pilotPlanesMap.get(plane.id);
      if (!ownedData || !ownedData.is_unlocked) return false;
      if (ownedData.level !== Number(filterLevel)) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filtros:</span>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-white outline-none focus:border-[var(--color-gaming-accent)]"
        >
          <option value="ALL">Todos los Tipos</option>
          <option value="Light Fighter">Light Fighter</option>
          <option value="Medium Fighter">Medium Fighter</option>
          <option value="Heavy Fighter">Heavy Fighter</option>
          <option value="Interceptor">Interceptor</option>
          <option value="Attack">Attack</option>
        </select>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-white outline-none focus:border-[var(--color-gaming-accent)]"
        >
          <option value="ALL">Cualquier Nivel</option>
          {[...Array(20)].map((_, i) => (
            <option key={i+1} value={i+1}>Nivel {i+1}</option>
          ))}
        </select>
      </div>

      {filteredAirplanes.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-white/5 p-4 rounded-full">
            <SearchX className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">No se encontraron aviones</h3>
          <p className="text-gray-400">
            Intenta cambiar los filtros de tipo o nivel para ver más resultados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filteredAirplanes.map(plane => {
        const ownedData = pilotPlanesMap.get(plane.id);
        const isUnlocked = ownedData?.is_unlocked || false;
        const isThisPlaneLoading = isPending && loadingPlaneId === plane.id;

        return (
          <div 
            key={plane.id} 
            className={cn(
              "relative glass-panel rounded-2xl overflow-hidden border transition-all duration-300",
              isUnlocked 
                ? "border-[var(--color-gaming-accent)]/50 shadow-[0_0_30px_rgba(0,229,255,0.1)]" 
                : "border-white/5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
            )}
          >
            {isThisPlaneLoading && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[var(--color-gaming-accent)] animate-spin" />
              </div>
            )}
            {/* Cabecera / Info del Avión */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white tracking-wider uppercase">{plane.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{plane.sub_name}</p>
                <span 
                  className="inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded-md"
                  style={{
                    color: 
                      plane.class.toLowerCase().includes('light fighter') ? '#9252E1' :
                      plane.class.toLowerCase().includes('medium fighter') ? '#CC7A31' :
                      plane.class.toLowerCase().includes('heavy fighter') ? '#C24740' :
                      plane.class.toLowerCase().includes('interceptor') ? '#2A8FCD' :
                      plane.class.toLowerCase().includes('attack') ? '#29A292' : 
                      'var(--color-gaming-secondary)'
                  }}
                >
                  {plane.class}
                </span>
              </div>
              
              <button
                onClick={() => handleToggle(plane.id, isUnlocked)}
                disabled={isPending || readOnly}
                className={cn(
                  "p-3 rounded-xl flex items-center justify-center transition-all",
                  isUnlocked 
                    ? "bg-[var(--color-gaming-accent)]/20 text-[var(--color-gaming-accent)] shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white"
                )}
              >
                {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>
            </div>

            {/* Imagen del Avión */}
            <div className="relative h-40 w-full flex items-center justify-center p-4">
              {/* Botones de Imágenes Tácticas */}
              <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
                {currentUserRole !== 'PILOT' && (
                  <button
                    onClick={() => setUploadingForPlane(plane)}
                    className="p-2 bg-black/60 hover:bg-[var(--color-gaming-accent)] text-white hover:text-black rounded-lg backdrop-blur border border-white/10 transition-colors"
                    title="Subir Guía Táctica"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>
                )}
                {tacticalImages.filter(img => img.airplane_id === plane.id).length > 0 && (
                  <button
                    onClick={() => setViewingGalleryForPlane(plane)}
                    className="p-2 bg-black/60 hover:bg-[var(--color-gaming-accent)] text-[var(--color-gaming-accent)] hover:text-black rounded-lg backdrop-blur border border-[var(--color-gaming-accent)]/50 transition-colors flex items-center justify-center relative"
                    title="Ver Guías Tácticas"
                  >
                    <Images className="w-4 h-4" />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {tacticalImages.filter(img => img.airplane_id === plane.id).length}
                    </span>
                  </button>
                )}
              </div>

              <img 
                src={`/assets/images/planes/${plane.name === 'JF-17' ? 'Jf-17' : plane.name.replace(/\//g, '')}.png`}
                alt={plane.name} 
                className="max-h-full max-w-full object-contain drop-shadow-2xl scale-[2] z-[-1]"
                onError={(e) => {
                  // Fallback a la imagen original de la DB si falla
                  (e.target as HTMLImageElement).src = plane.image_url;
                }}
              />
            </div>

            {/* Controles de Nivel (Solo si está desbloqueado) */}
            {isUnlocked && ownedData && (
              <div className="bg-black/60 p-4 border-t border-white/5 space-y-4">
                {/* Nivel General */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Nivel de Avión</span>
                  </div>
                  {readOnly ? (
                    <div className="bg-black/80 border border-white/20 text-white rounded-lg px-3 py-1 text-sm font-bold">
                      Nvl. {ownedData.level}
                    </div>
                  ) : (
                    <select
                      value={ownedData.level}
                      onChange={(e) => handleLevelChange(plane.id, 'level', parseInt(e.target.value))}
                      disabled={isPending}
                      className="bg-black/80 border border-white/20 text-white rounded-lg px-3 py-1 text-sm font-bold focus:border-[var(--color-gaming-accent)] focus:outline-none"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>Nvl. {n}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Habilidad Especial (Nivel >= 8) */}
                {ownedData.level >= 8 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Hab. Especial</span>
                    </div>
                    {readOnly ? (
                      <div className="bg-black/80 border border-white/20 text-yellow-500 rounded-lg px-3 py-1 text-sm font-bold">
                        {ownedData.special_ability_level === 0 ? 'Bloqueada' : `Nvl. ${ownedData.special_ability_level}`}
                      </div>
                    ) : (
                      <select
                        value={ownedData.special_ability_level}
                        onChange={(e) => handleLevelChange(plane.id, 'special_ability_level', parseInt(e.target.value))}
                        disabled={isPending}
                        className="bg-black/80 border border-white/20 text-yellow-500 rounded-lg px-3 py-1 text-sm font-bold focus:border-yellow-500 focus:outline-none"
                      >
                        {Array.from({ length: 4 }, (_, i) => i).map(n => (
                          <option key={n} value={n}>{n === 0 ? 'Bloqueada' : `Nvl. ${n}`}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Habilidad Pasiva (Nivel >= 12) */}
                {ownedData.level >= 12 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[var(--color-gaming-secondary)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Hab. Pasiva</span>
                    </div>
                    {readOnly ? (
                      <div className="bg-black/80 border border-white/20 text-[var(--color-gaming-secondary)] rounded-lg px-3 py-1 text-sm font-bold">
                        {ownedData.passive_ability_level === 0 ? 'Bloqueada' : `Nvl. ${ownedData.passive_ability_level}`}
                      </div>
                    ) : (
                      <select
                        value={ownedData.passive_ability_level}
                        onChange={(e) => handleLevelChange(plane.id, 'passive_ability_level', parseInt(e.target.value))}
                        disabled={isPending}
                        className="bg-black/80 border border-white/20 text-[var(--color-gaming-secondary)] rounded-lg px-3 py-1 text-sm font-bold focus:border-[var(--color-gaming-secondary)] focus:outline-none"
                      >
                        {Array.from({ length: 6 }, (_, i) => i).map(n => (
                          <option key={n} value={n}>{n === 0 ? 'Bloqueada' : `Nvl. ${n}`}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Modificadores (Nivel >= 16) */}
                {ownedData.level >= 16 && (
                  <div className="pt-2 mt-2 border-t border-white/5 space-y-3">
                    {/* Modificador 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Modificador 1</span>
                      </div>
                      <div className="flex gap-2">
                        {readOnly ? (
                          <>
                            <div className="flex-1 relative bg-black/80 border border-white/20 text-white rounded-lg px-2 py-1.5 text-xs font-bold uppercase flex items-center justify-between">
                              <span>{ownedData.mod1_name || 'Ninguno'}</span>
                              {ownedData.mod1_name && (
                                <img 
                                  src={MODIFIERS.find(m => m.name === ownedData.mod1_name)?.image} 
                                  alt="Mod" 
                                  className="w-6 h-6 object-contain pointer-events-none drop-shadow-md"
                                />
                              )}
                            </div>
                            {ownedData.mod1_name && (
                              <div className="w-16 bg-black/80 border border-white/20 text-orange-400 rounded-lg px-2 py-1.5 text-sm font-black text-center flex items-center justify-center">
                                L{ownedData.mod1_level || 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex-1 relative">
                              <select
                                value={ownedData.mod1_name || ''}
                                onChange={(e) => {
                                  const newName = e.target.value === '' ? null : e.target.value;
                                  handleLevelChange(plane.id, 'mod1_name', newName);
                                  if (newName && !ownedData.mod1_level) {
                                    handleLevelChange(plane.id, 'mod1_level', 1);
                                  } else if (!newName) {
                                    handleLevelChange(plane.id, 'mod1_level', null);
                                  }
                                }}
                                disabled={isPending}
                                className="w-full bg-black/80 border border-white/20 text-white rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase focus:border-orange-400 focus:outline-none appearance-none"
                              >
                                <option value="">Ninguno</option>
                                {MODIFIERS.map(m => (
                                  <option key={m.name} value={m.name}>{m.name}</option>
                                ))}
                              </select>
                              {ownedData.mod1_name && (
                                <img 
                                  src={MODIFIERS.find(m => m.name === ownedData.mod1_name)?.image} 
                                  alt="Mod" 
                                  className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 object-contain pointer-events-none"
                                />
                              )}
                            </div>
                            {ownedData.mod1_name && (
                              <select
                                value={ownedData.mod1_level || 1}
                                onChange={(e) => handleLevelChange(plane.id, 'mod1_level', parseInt(e.target.value))}
                                disabled={isPending}
                                className="w-16 bg-black/80 border border-white/20 text-orange-400 rounded-lg px-2 py-1.5 text-[10px] font-bold focus:border-orange-400 focus:outline-none text-center"
                              >
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>L{n}</option>
                                ))}
                              </select>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Modificador 2 (Solo nivel 20) */}
                    {ownedData.level >= 20 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Modificador 2</span>
                        </div>
                        <div className="flex gap-2">
                          {readOnly ? (
                            <>
                              <div className="flex-1 relative bg-black/80 border border-white/20 text-white rounded-lg px-2 py-1.5 text-xs font-bold uppercase flex items-center justify-between">
                                <span>{ownedData.mod2_name || 'Ninguno'}</span>
                                {ownedData.mod2_name && (
                                  <img 
                                    src={MODIFIERS.find(m => m.name === ownedData.mod2_name)?.image} 
                                    alt="Mod" 
                                    className="w-6 h-6 object-contain pointer-events-none drop-shadow-md"
                                  />
                                )}
                              </div>
                              {ownedData.mod2_name && (
                                <div className="w-16 bg-black/80 border border-white/20 text-orange-400 rounded-lg px-2 py-1.5 text-sm font-black text-center flex items-center justify-center">
                                  L{ownedData.mod2_level || 1}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex-1 relative">
                                <select
                                  value={ownedData.mod2_name || ''}
                                  onChange={(e) => {
                                    const newName = e.target.value === '' ? null : e.target.value;
                                    handleLevelChange(plane.id, 'mod2_name', newName);
                                    if (newName && !ownedData.mod2_level) {
                                      handleLevelChange(plane.id, 'mod2_level', 1);
                                    } else if (!newName) {
                                      handleLevelChange(plane.id, 'mod2_level', null);
                                    }
                                  }}
                                  disabled={isPending}
                                  className="w-full bg-black/80 border border-white/20 text-white rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase focus:border-orange-400 focus:outline-none appearance-none"
                                >
                                  <option value="">Ninguno</option>
                                  {MODIFIERS.map(m => (
                                    <option key={m.name} value={m.name}>{m.name}</option>
                                  ))}
                                </select>
                                {ownedData.mod2_name && (
                                  <img 
                                    src={MODIFIERS.find(m => m.name === ownedData.mod2_name)?.image} 
                                    alt="Mod" 
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 object-contain pointer-events-none"
                                  />
                                )}
                              </div>
                              {ownedData.mod2_name && (
                                <select
                                  value={ownedData.mod2_level || 1}
                                  onChange={(e) => handleLevelChange(plane.id, 'mod2_level', parseInt(e.target.value))}
                                  disabled={isPending}
                                  className="w-16 bg-black/80 border border-white/20 text-orange-400 rounded-lg px-2 py-1.5 text-[10px] font-bold focus:border-orange-400 focus:outline-none text-center"
                                >
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>L{n}</option>
                                  ))}
                                </select>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
        })}
        </div>
      )}
      {/* Modals de Imágenes Tácticas */}
      {uploadingForPlane && (
        <TacticalImageModal
          airplaneId={uploadingForPlane.id}
          airplaneName={uploadingForPlane.name}
          onClose={() => setUploadingForPlane(null)}
        />
      )}
      
      {viewingGalleryForPlane && (
        <TacticalGalleryModal
          airplaneName={viewingGalleryForPlane.name}
          images={tacticalImages.filter(img => img.airplane_id === viewingGalleryForPlane.id)}
          onClose={() => setViewingGalleryForPlane(null)}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
