import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, BookmarkCheck } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab: Mis rutas if pathname starts with /mis-rutas, otherwise Inicio
  const isMisRutas = location.pathname.startsWith('/mis-rutas');
  const isInicio = !isMisRutas;

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-40 bg-white border-t border-slate-200/90 shadow-md shrink-0"
    >
      <div className="grid grid-cols-2 max-w-[430px] mx-auto px-2">
        {/* Tab 1: Inicio */}
        <button
          onClick={() => navigate('/')}
          type="button"
          className={`touch-target flex flex-col items-center justify-center py-2 transition-colors relative ${
            isInicio
              ? 'text-[#1f5c8b] font-bold'
              : 'text-slate-500 font-medium active:text-slate-800'
          }`}
          aria-current={isInicio ? 'page' : undefined}
        >
          <div className="relative">
            <Compass className={`w-6 h-6 ${isInicio ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {isInicio && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#1f5c8b] rounded-full" />
            )}
          </div>
          <span className="text-[12px] mt-1 leading-none tracking-tight">
            Inicio
          </span>
        </button>

        {/* Tab 2: Mis rutas */}
        <button
          onClick={() => navigate('/mis-rutas')}
          type="button"
          className={`touch-target flex flex-col items-center justify-center py-2 transition-colors relative ${
            isMisRutas
              ? 'text-[#1f5c8b] font-bold'
              : 'text-slate-500 font-medium active:text-slate-800'
          }`}
          aria-current={isMisRutas ? 'page' : undefined}
        >
          <div className="relative">
            <BookmarkCheck className={`w-6 h-6 ${isMisRutas ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {isMisRutas && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#1f5c8b] rounded-full" />
            )}
          </div>
          <span className="text-[12px] mt-1 leading-none tracking-tight">
            Mis rutas
          </span>
        </button>
      </div>

      {/* Safe area padding bottom */}
      <div className="safe-bottom-h sm:h-2" />
    </nav>
  );
};
