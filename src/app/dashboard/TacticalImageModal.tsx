'use client';

import { useState, useTransition, useEffect } from 'react';
import { uploadTacticalImage, updateTacticalImage } from './actions';
import { X, Upload, Loader2, Image as ImageIcon, Save } from 'lucide-react';
import { TacticalImage } from './TacticalGalleryModal';

interface TacticalImageModalProps {
  airplaneId: string;
  airplaneName: string;
  onClose: () => void;
  editingImage?: TacticalImage;
}

const GAME_MODE_ICONS: Record<string, string> = {
  'Objetivo prioritario': '/assets/images/modsGames/PriorityTarget.webp',
  'Combate a muerte por equipos': '/assets/images/modsGames/Gamemode-icons-death-match.webp',
  'Superioridad Aérea': '/assets/images/modsGames/Gamemode-icons-control-points.webp'
};

export function TacticalImageModal({ airplaneId, airplaneName, onClose, editingImage }: TacticalImageModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(editingImage?.image_url || null);
  const [comment, setComment] = useState(editingImage?.comment || '');
  
  const [gameModes, setGameModes] = useState({
    'Objetivo prioritario': editingImage ? editingImage.game_modes.includes('Objetivo prioritario') : false,
    'Superioridad Aérea': editingImage ? editingImage.game_modes.includes('Superioridad Aérea') : false,
    'Combate a muerte por equipos': editingImage ? editingImage.game_modes.includes('Combate a muerte por equipos') : false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Límite de 4MB para evitar errores 413 Payload Too Large en Vercel
      if (file.size > 4 * 1024 * 1024) {
        setError('La imagen es demasiado pesada. El tamaño máximo permitido es 4MB.');
        e.target.value = ''; // Limpiar el input
        setSelectedFile(null);
        if (!editingImage) setPreviewUrl(null);
        return;
      }

      setError('');
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleToggleMode = (mode: keyof typeof gameModes) => {
    setGameModes(prev => ({ ...prev, [mode]: !prev[mode] }));
  };

  const handleUpload = () => {
    if (!editingImage && !selectedFile) {
      setError('Por favor selecciona una imagen.');
      return;
    }
    
    const selectedModes = Object.entries(gameModes).filter(([_, v]) => v).map(([k]) => k);
    if (selectedModes.length === 0) {
      setError('Por favor selecciona al menos un tipo de juego.');
      return;
    }

    startTransition(async () => {
      setError('');
      const formData = new FormData();
      formData.append('airplaneId', airplaneId);
      formData.append('gameModes', JSON.stringify(selectedModes));
      formData.append('comment', comment);

      if (editingImage) {
        // Edit mode (no image upload)
        const res = await updateTacticalImage(editingImage.id, formData);
        if (res?.error) {
          setError(res.error);
        } else {
          onClose();
        }
      } else {
        // Create mode
        formData.append('image', selectedFile!);
        const res = await uploadTacticalImage(formData);
        if (res?.error) {
          setError(res.error);
        } else {
          onClose();
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isPending ? onClose : undefined}></div>
      <div className="bg-[#151a2d] border border-[var(--color-gaming-accent)]/20 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {editingImage ? <Save className="w-6 h-6 text-[var(--color-gaming-accent)]" /> : <Upload className="w-6 h-6 text-[var(--color-gaming-accent)]" />}
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              {editingImage ? `Editar Guía - ${airplaneName}` : `Subir Guía - ${airplaneName}`}
            </h3>
          </div>
          <button onClick={onClose} disabled={isPending} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* File input (Only when creating) */}
          {!editingImage && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Imagen</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[var(--color-gaming-accent)] hover:bg-[var(--color-gaming-accent)]/5 transition-all bg-black/30 overflow-hidden relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400 font-bold">Haz clic para buscar o arrastra una imagen</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isPending} />
              </label>
            </div>
          )}

          {/* Game Modes Checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Modos de Juego Asociados</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(gameModes).map((mode) => (
                <label key={mode} className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${gameModes[mode as keyof typeof gameModes] ? 'bg-[var(--color-gaming-accent)] border-[var(--color-gaming-accent)]' : 'bg-transparent border-white/30'}`}>
                    {gameModes[mode as keyof typeof gameModes] && <X className="w-3 h-3 text-black" style={{ transform: 'rotate(45deg)' }} />}
                  </div>
                  {GAME_MODE_ICONS[mode] && (
                    <img src={GAME_MODE_ICONS[mode]} alt={mode} className="w-6 h-6 object-contain" />
                  )}
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{mode}</span>
                  <input type="checkbox" className="hidden" checked={gameModes[mode as keyof typeof gameModes]} onChange={() => handleToggleMode(mode as keyof typeof gameModes)} disabled={isPending} />
                </label>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Comentario (Opcional)</label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-[var(--color-gaming-accent)] focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Ej: Ideal para atacar tanques..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button 
            onClick={handleUpload} 
            disabled={isPending}
            className="w-full bg-[var(--color-gaming-accent)] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00c4e5] transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingImage ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />)}
            {isPending ? 'Guardando...' : (editingImage ? 'Guardar Cambios' : 'Subir Imagen')}
          </button>
        </div>
      </div>
    </div>
  );
}
