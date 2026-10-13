import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Quitar',
  cancelText = 'Cancelar',
  isDestructive = true,
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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro que cierra al tocar */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cuadro de diálogo modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleIn text-center"
      >
        {isDestructive && (
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#b3382c] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {title}
          </h3>
          {message && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full touch-target min-h-[48px] py-2.5 px-4 rounded-xl font-bold text-sm shadow-sm active:scale-[0.99] transition-all flex items-center justify-center ${
              isDestructive
                ? 'bg-[#b3382c] text-white active:bg-[#922d23]'
                : 'bg-[#1f5c8b] text-white active:bg-[#18496e]'
            }`}
          >
            {confirmText}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full touch-target min-h-[48px] py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm active:bg-slate-50 transition-all flex items-center justify-center"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
