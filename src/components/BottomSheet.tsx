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

      {/* Contenedor de la hoja inferior: absolute dentro de la página, max-h-[85%] con scroll */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel inferior'}
        className="relative z-10 w-full max-h-[85%] bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(11,27,63,0.12)] border-t border-[#E3E8F4] flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Manija gris pequeña arriba */}
        <div className="pt-3 pb-1 px-4 flex items-center justify-between border-b border-[#E3E8F4] shrink-0 relative">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          
          <div className="min-w-0 pr-2 pt-2">
            {title && (
              <h3 className="text-[18px] font-bold text-[#0B1B3F] truncate">
                {title}
              </h3>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="touch-target min-w-[48px] min-h-[48px] p-2 text-[#5B6B8C] active:text-[#0B1B3F] rounded-full shrink-0 flex items-center justify-center -mr-2"
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
