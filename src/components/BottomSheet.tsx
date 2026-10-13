import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
      {/* Fondo oscuro semitransparente que cierra al tocar */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor de la hoja inferior: absolute dentro de la página, max-h-[85dvh] con scroll */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel inferior'}
        className="relative z-10 w-full max-h-[85dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Barra superior / Indicador de arrastre */}
        <div className="pt-3 pb-1 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          
          <div className="min-w-0 pr-2 pt-2">
            {title && (
              <h3 className="text-base font-bold text-slate-900 truncate">
                {title}
              </h3>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="touch-target p-1.5 text-slate-400 active:text-slate-700 rounded-full shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>

        {/* Espacio inferior para el área segura del iPhone */}
        <div className="safe-bottom-h shrink-0 sm:h-2" />
      </div>
    </div>
  );
};
