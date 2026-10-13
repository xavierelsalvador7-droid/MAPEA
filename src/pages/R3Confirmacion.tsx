import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { CheckCircle2, ArrowRight, PlusCircle, Home } from 'lucide-react';

export const R3Confirmacion: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const o = searchParams.get('o') || '';
  const d = searchParams.get('d') || '';
  const r = searchParams.get('r') || '';

  const hasTripContext = Boolean(o && d && r);

  const handleReturnToTrip = () => {
    if (hasTripContext) {
      navigate(`/detalle?o=${encodeURIComponent(o)}&d=${encodeURIComponent(d)}&r=${encodeURIComponent(r)}`);
    } else {
      navigate('/');
    }
  };

  const handleMakeAnotherReport = () => {
    const params = new URLSearchParams();
    if (o) params.set('o', o);
    if (d) params.set('d', d);
    if (r) params.set('r', r);
    navigate(`/reporte/tipo?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar title="Confirmación" showBack={false} />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4">
          
          {/* Ícono de check verde */}
          <div className="w-20 h-20 rounded-full bg-emerald-100/90 text-[#2e7d32] flex items-center justify-center mb-5 shadow-sm border border-emerald-200">
            <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
            ¡Gracias por avisar!
          </h2>

          <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
            Tu reporte ayuda a otras personas que usan la ruta.
          </p>

          <div className="mt-6 px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 max-w-xs">
            <span className="font-semibold text-slate-800">Aviso publicado</span>
            <p className="mt-0.5 text-slate-500">
              Quedó registrado para los usuarios en la consulta de rutas.
            </p>
          </div>
        </div>

        {/* Botones de acción al final */}
        <div className="space-y-3 pb-4">
          {/* Botón Principal: Volver a mi viaje */}
          <button
            type="button"
            onClick={handleReturnToTrip}
            className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-base shadow-md active:bg-[#18496e] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {hasTripContext ? (
              <>
                <span>Volver a mi viaje</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Home className="w-5 h-5" />
                <span>Volver a Inicio</span>
              </>
            )}
          </button>

          {/* Botón Secundario: Hacer otro reporte */}
          <button
            type="button"
            onClick={handleMakeAnotherReport}
            className="w-full touch-target min-h-[48px] py-3 px-4 rounded-xl bg-white text-slate-700 border border-slate-300 font-bold text-sm active:bg-slate-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Hacer otro reporte</span>
          </button>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
