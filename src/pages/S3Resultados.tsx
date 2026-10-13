import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import {
  MOCK_JOURNEYS,
  KNOWN_PLACES,
  DATA_LAST_UPDATED,
  RouteOption,
} from '../data/mockData';
import { getAlertsForRoute } from '../utils/alerts';
import {
  ChevronRight,
  Clock,
  AlertTriangle,
  RouteOff,
  ArrowRight,
  Calendar
} from 'lucide-react';

function formatDuration(text: string): string {
  const clean = text.replace(/^aprox\.?\s*/i, '').trim();
  return `aprox. ${clean}`;
}

export const S3Resultados: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const originId = searchParams.get('o') || '';
  const destId = searchParams.get('d') || '';

  const originPlace = KNOWN_PLACES.find((p) => p.id === originId);
  const destPlace = KNOWN_PLACES.find((p) => p.id === destId);

  // Buscar el trayecto con ese origen y destino
  const journey = MOCK_JOURNEYS.find(
    (j) => j.originId === originId && j.destinationId === destId
  );

  // Ordenar hasta 3 opciones de menor a mayor durationMinutes
  const options: RouteOption[] = journey
    ? [...journey.options]
        .sort((a, b) => a.durationMinutes - b.durationMinutes)
        .slice(0, 3)
    : [];

  const handleSelectOption = (optionId: string) => {
    navigate(`/detalle?o=${encodeURIComponent(originId)}&d=${encodeURIComponent(destId)}&r=${encodeURIComponent(optionId)}`);
  };

  const handleTryAnotherDest = () => {
    try {
      sessionStorage.removeItem('rutea_s2_dest');
    } catch {
      // ignore
    }
    navigate('/buscar');
  };

  const originName = originPlace ? originPlace.name : 'Origen';
  const destName = destPlace ? destPlace.name : 'Destino';

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar title="Resultados" showBack={true} backFallback="/buscar" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Encabezado con origen, destino y fecha de datos */}
          <header className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 leading-snug flex-wrap">
              <span>{originName}</span>
              <span className="text-slate-400 font-normal">a</span>
              <span className="text-[#1f5c8b]">{destName}</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Datos al: {DATA_LAST_UPDATED}</span>
            </div>
          </header>

          {/* Estado SIN RUTAS (5b) */}
          {(!journey || options.length === 0) ? (
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-sm mt-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b26a00] mb-4">
                <RouteOff className="w-8 h-8" />
              </div>

              <h2 className="text-base font-bold text-slate-800 mb-1 max-w-xs leading-snug">
                Aún no tenemos una ruta para este viaje
              </h2>

              <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                Estamos trabajando para incorporar más recorridos y conexiones interurbanas.
              </p>

              <button
                type="button"
                onClick={handleTryAnotherDest}
                className="w-full max-w-xs touch-target min-h-[48px] px-4 py-3 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md active:bg-[#18496e] transition-all flex items-center justify-center gap-2"
              >
                <span>Probar otro destino</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* LISTA DE OPCIONES DE RUTA */
            <section className="space-y-3" aria-label="Opciones de ruta disponibles">
              {options.map((option) => {
                const alerts = getAlertsForRoute(option.code);
                const hasAlert = alerts.length > 0;
                const latestAlert = alerts[0];
                const extraAlerts = alerts.length - 1;

                const isDirecta = option.type === 'directa';

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className="w-full touch-target min-h-[64px] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-left flex flex-col justify-between gap-3 active:scale-[0.99] active:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900 leading-tight">
                            {option.code}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                              isDirecta
                                ? 'bg-emerald-50 text-[#2e7d32] border-emerald-200'
                                : 'bg-blue-50 text-[#1f5c8b] border-blue-200'
                            }`}
                          >
                            {isDirecta ? 'Directa' : 'Con combinación'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDuration(option.durationText)}</span>
                        </div>
                      </div>

                      <div className="shrink-0 p-2 text-slate-400 group-active:text-[#1f5c8b] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Franja de aviso en la tarjeta si tiene avisos */}
                    {hasAlert && (
                      <div className="w-full bg-[#fff4cc] border border-[#e0b400] rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-xs text-slate-800">
                        <AlertTriangle className="w-4 h-4 text-[#b26a00] shrink-0" />
                        <span className="font-semibold text-[11px] text-[#b26a00] leading-tight">
                          Aviso {latestAlert.reportedTimeAgo}
                          {extraAlerts > 0 && ` · +${extraAlerts} aviso${extraAlerts > 1 ? 's' : ''} más`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </section>
          )}

        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
