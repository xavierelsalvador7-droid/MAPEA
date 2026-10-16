import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, BookmarkCheck } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab determination
  const isMisRutas = location.pathname.startsWith('/mis-rutas');
  const isInicio = !isMisRutas;

  return (
    <div className="shrink-0 p-3 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent flex justify-center z-40">
      <nav
        aria-label="Navegación principal"
        className="w-full max-w-[340px] bg-white rounded-full shadow-[0_4px_20px_rgba(11,27,63,0.12)] border border-[#E3E8F4] p-1 flex items-center gap-1"
      >
        {/* Tab 1: Inicio */}
        <button
          onClick={() => navigate('/')}
          type="button"
          className={`flex-1 min-h-[44px] rounded-full flex items-center justify-center gap-2 transition-all ${
            isInicio
              ? 'bg-[#E4EBFD] text-[#1F4BD8] font-bold'
              : 'text-[#5B6B8C] font-medium active:bg-[#F2F5FB]'
          }`}
          aria-current={isInicio ? 'page' : undefined}
        >
          <Compass className={`w-5 h-5 ${isInicio ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[14px] leading-none">Inicio</span>
        </button>

        {/* Tab 2: Mis rutas */}
        <button
          onClick={() => navigate('/mis-rutas')}
          type="button"
          className={`flex-1 min-h-[44px] rounded-full flex items-center justify-center gap-2 transition-all ${
            isMisRutas
              ? 'bg-[#E4EBFD] text-[#1F4BD8] font-bold'
              : 'text-[#5B6B8C] font-medium active:bg-[#F2F5FB]'
          }`}
          aria-current={isMisRutas ? 'page' : undefined}
        >
          <BookmarkCheck className={`w-5 h-5 ${isMisRutas ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[14px] leading-none">Mis rutas</span>
        </button>
      </nav>
    </div>
  );
};
