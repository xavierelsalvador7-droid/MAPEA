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
        className="relative z-10 w-full max-w-xs bg-white rounded-[22px] p-5 shadow-2xl border border-[#E3E8F4] space-y-4 animate-scaleIn text-center"
      >
        {isDestructive && (
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#B42318] flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-[20px] font-bold text-[#0B1B3F] leading-snug">
            {title}
          </h3>
          {message && (
            <p className="text-[13px] text-[#5B6B8C] leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full touch-target min-h-[48px] py-3 px-4 rounded-[22px] font-bold text-sm active:scale-[0.99] transition-all flex items-center justify-center ${
              isDestructive
                ? 'bg-[#B42318] text-white active:bg-red-800'
                : 'bg-[#1F4BD8] text-white active:bg-blue-800'
            }`}
          >
            {confirmText}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full touch-target min-h-[48px] py-3 px-4 rounded-[22px] bg-[#E4EBFD] text-[#1F4BD8] font-bold text-sm active:bg-blue-100 transition-all flex items-center justify-center"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
