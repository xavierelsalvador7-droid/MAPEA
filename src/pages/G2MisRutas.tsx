import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { Construction, Bookmark, ArrowRight, Route } from 'lucide-react';

export const G2MisRutas: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar title="Mis rutas" showBack={false} subtitle="Tus trayectos guardados" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-[#2e7d32] text-xs font-bold mb-4 tracking-wider">
            <span>PESTAÑA G2</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-[#2e7d32] mb-4 shadow-sm">
            <Bookmark className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Mis rutas guardadas
          </h2>

          <div className="inline-block bg-amber-50 text-[#b26a00] border border-amber-200 px-4 py-1.5 rounded-lg text-sm font-semibold mb-3">
            En construcción
          </div>

          <p className="text-sm text-slate-600 max-w-xs mt-2 leading-relaxed">
            Aquí podrás consultar de forma rápida los viajes que guardes en tu celular para no tener que buscarlos cada vez.
          </p>
        </div>

        {/* Action to open S4 as required: "(desde aquí también se puede abrir S4)" */}
        <div className="space-y-3 pb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Acción del prototipo
          </p>
          <button
            type="button"
            onClick={() => navigate('/detalle')}
            className="w-full touch-target min-h-[52px] px-4 py-3.5 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm flex items-center justify-between shadow-md active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-200" />
              <span>Ver ejemplo de Detalle del viaje (S4)</span>
            </div>
            <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
          </button>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
