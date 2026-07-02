'use client';

import { X, ChevronLeft, ChevronRight, User, ZoomIn, ZoomOut, Edit, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { useState, useTransition } from 'react';
import { deleteTacticalImage } from './actions';
import { TacticalImageModal } from './TacticalImageModal';

export type TacticalImage = {
  id: string;
  airplane_id: string;
  image_url: string;
  game_modes: string[];
  comment?: string | null;
  uploader_id: string | null;
  created_at: string;
  profiles?: {
    username: string;
  } | null;
};

interface TacticalGalleryModalProps {
  airplaneName: string;
  images: TacticalImage[];
  onClose: () => void;
  currentUserRole?: string;
  currentUserId?: string;
}

const GAME_MODE_ICONS: Record<string, string> = {
  'Objetivo prioritario': '/assets/images/modsGames/PriorityTarget.webp',
  'Combate a muerte por equipos': '/assets/images/modsGames/Gamemode-icons-death-match.webp',
  'Superioridad Aérea': '/assets/images/modsGames/Gamemode-icons-control-points.webp'
};

export function TacticalGalleryModal({ airplaneName, images, onClose, currentUserRole, currentUserId }: TacticalGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!images || images.length === 0) return null;

  // Make sure we don't go out of bounds if an image is deleted
  const safeIndex = currentIndex >= images.length ? Math.max(0, images.length - 1) : currentIndex;
  const currentImage = images[safeIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const executeDelete = () => {
    setShowDeleteConfirm(false);
    startTransition(async () => {
      await deleteTacticalImage(currentImage.id, currentImage.image_url);
      if (images.length === 1) {
        onClose(); // Cerrar si era la única
      }
    });
  };

  const canEdit = currentUserId === currentImage.uploader_id || currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';
  const canDelete = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={!isPending ? onClose : undefined}></div>
        <div className="bg-[#151a2d] border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Guías Tácticas - {airplaneName}
              </h3>
              <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mt-1">
                Imagen {safeIndex + 1} de {images.length}
              </p>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  disabled={isPending}
                  className="text-gray-400 hover:text-[var(--color-gaming-accent)] transition-colors bg-white/5 p-2 rounded-xl"
                  title="Editar datos de la imagen"
                >
                  <Edit className="w-6 h-6" />
                </button>
              )}
              {canDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-xl"
                  title="Eliminar imagen"
                >
                  {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                </button>
              )}
              <button 
                onClick={() => setIsZoomed(!isZoomed)} 
                className="text-gray-400 hover:text-[var(--color-gaming-accent)] transition-colors bg-white/5 p-2 rounded-xl"
                title={isZoomed ? "Quitar Zoom" : "Acercar Zoom"}
              >
                {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
              </button>
              <button onClick={onClose} disabled={isPending} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl hover:bg-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 relative bg-black/50 rounded-2xl border border-white/5 ${isZoomed ? 'overflow-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent' : 'overflow-hidden flex items-center justify-center'}`}>
            {images.length > 1 && !isZoomed && (
              <button 
                onClick={handlePrev}
                className="absolute left-4 z-20 p-3 bg-black/60 hover:bg-[var(--color-gaming-accent)] text-white hover:text-black rounded-full backdrop-blur transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img 
              key={currentImage.id}
              src={currentImage.image_url} 
              alt="Tactical Guide" 
              className={`animate-in fade-in duration-300 ${isZoomed ? 'w-full h-auto cursor-zoom-out' : 'max-w-full max-h-full object-contain cursor-zoom-in'} ${isPending ? 'opacity-50' : ''}`} 
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {images.length > 1 && !isZoomed && (
              <button 
                onClick={handleNext}
                className="absolute right-4 z-20 p-3 bg-black/60 hover:bg-[var(--color-gaming-accent)] text-white hover:text-black rounded-full backdrop-blur transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Footer (Info) */}
          <div className="mt-4 flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 shrink-0">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 flex-1">
                {currentImage.game_modes.map((mode, i) => (
                  <span key={i} className="flex items-center gap-2 bg-[var(--color-gaming-accent)]/20 text-[var(--color-gaming-accent)] border border-[var(--color-gaming-accent)]/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {GAME_MODE_ICONS[mode] && (
                      <img src={GAME_MODE_ICONS[mode]} alt={mode} className="w-4 h-4 object-contain" />
                    )}
                    {mode}
                  </span>
                ))}
              </div>
              {currentImage.profiles?.username && (
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Subido por <span className="text-white">{currentImage.profiles.username}</span>
                  </span>
                </div>
              )}
            </div>
            
            {currentImage.comment && (
              <div className="flex items-start gap-3 pt-3 border-t border-white/10 mt-1">
                <MessageSquare className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 italic">{currentImage.comment}</p>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {isEditing && (
        <TacticalImageModal
          airplaneId={currentImage.airplane_id}
          airplaneName={airplaneName}
          editingImage={currentImage}
          onClose={() => setIsEditing(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="bg-[#151a2d] border border-red-500/30 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 text-center text-red-500">
              ¿Eliminar Guía?
            </h3>
            <p className="text-gray-400 text-center mb-6">
              Esta acción eliminará la imagen para todos y no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                disabled={isPending}
                className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 rounded-xl border border-red-500/50 transition-colors uppercase tracking-wider text-sm flex items-center justify-center"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
