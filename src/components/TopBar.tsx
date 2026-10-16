import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  backFallback?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  backFallback = '/',
  subtitle,
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(backFallback);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-[#0B1B3F] border-b border-[#E3E8F4] shrink-0">
      {/* Safe area padding top */}
      <div className="safe-top-h sm:h-2" />

      <div className="flex items-center justify-between px-3 h-14">
        <div className="flex items-center min-w-0 gap-1.5">
          {showBack && (
            <button
              onClick={handleBack}
              type="button"
              aria-label="Regresar a la pantalla anterior"
              className="touch-target min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-[#0B1B3F] active:bg-[#F2F5FB] transition-colors -ml-1"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.25]" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-[20px] font-bold tracking-tight text-[#0B1B3F] truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[12px] text-[#5B6B8C] font-normal truncate leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction ? (
          <div className="shrink-0 flex items-center">{rightAction}</div>
        ) : (
          <div className="w-6" />
        )}
      </div>
    </header>
  );
};
