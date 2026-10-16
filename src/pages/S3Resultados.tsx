import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BottomTabBar } from '../components/BottomTabBar';
import { MapaReferencia } from '../components/MapaReferencia';
import {
  MOCK_JOURNEYS,
  KNOWN_PLACES,
  DATA_LAST_UPDATED,
  RouteOption,
} from '../data/mockData';
import { getAlertsForRoute, getTimeAgoText } from '../utils/alerts';
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  RouteOff,
  ArrowRight,
  Calendar
} from 'lucide-react';

function getDurationMinutesNumber(text: string): string {
  const match = text.match(/\d+/);
  return match ? `${match[0]} min` : text;
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
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      {/* 1. MAPA ARRIBA CON LA RUTA MARCADA */}
      <div className="relative w-full h-[220px] shrink-0 bg-[#EAEFF7]">
        <MapaReferencia
          mostrarRuta={true}
          className="w-full h-full"
        />

        {/* Barra flotante blanca encima del mapa: Flecha atrás y Origen → Destino */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-[22px] px-2.5 py-1.5 shadow-[0_2px_12px_rgba(11,27,63,0.08)] border border-[#E3E8F4]">
          <button
            onClick={() => navigate('/buscar')}
            type="button"
            aria-label="Regresar a la búsqueda"
            className="touch-target min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#0B1B3F] active:bg-[#F2F5FB] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>

          <div className="min-w-0 flex-1 pr-3">
            <p className="text-[14px] font-bold text-[#0B1B3F] truncate leading-tight">
              <span>{originName}</span>
              <span className="text-[#1F4BD8] mx-1.5">→</span>
              <span>{destName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. HOJA INFERIOR CON EL CONTENIDO (Esquinas superiores de 28 px, manija gris) */}
      <div className="flex-1 min-h-0 bg-white rounded-t-[28px] shadow-[0_-8px_30px_rgba(11,27,63,0.08)] border-t border-[#E3E8F4] flex flex-col -mt-4 z-10 relative overflow-hidden">
        {/* Manija gris superior */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-[18px] pb-2 space-y-3">
          {/* Metadata de fecha */}
          <div className="flex items-center justify-between text-[12px] text-[#5B6B8C] font-medium pt-0.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Datos al: {DATA_LAST_UPDATED}</span>
            </span>
            {options.length > 0 && (
              <span>{options.length} {options.length === 1 ? 'opción' : 'opciones'}</span>
            )}
          </div>

          {/* Estado SIN RUTAS (5b / CU4) */}
          {(!journey || options.length === 0) ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center bg-[#F2F5FB] rounded-[22px] border border-[#E3E8F4]">
              <div className="w-14 h-14 rounded-[16px] bg-[#E4EBFD] text-[#1F4BD8] flex items-center justify-center mb-3">
                <RouteOff className="w-7 h-7 stroke-[2.25]" />
              </div>

              <h2 className="text-[19px] font-bold text-[#0B1B3F] mb-1.5 max-w-xs leading-snug">
                Aún no tenemos una ruta para este viaje
              </h2>

              <p className="text-[13px] text-[#5B6B8C] max-w-xs mb-5 leading-relaxed">
                Estamos trabajando para incorporar más recorridos y conexiones interurbanas.
              </p>

              <button
                type="button"
                onClick={handleTryAnotherDest}
                className="w-full max-w-xs touch-target min-h-[48px] px-5 py-3 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-xs"
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
                const routeShortNum = option.code.replace(/^Ruta\s*/i, '').trim();
                const durationBig = getDurationMinutesNumber(option.durationText);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className="w-full touch-target min-h-[72px] bg-[#F2F5FB] rounded-[22px] p-4 border border-[#E3E8F4] text-left flex flex-col justify-between gap-2.5 active:bg-[#E4EBFD]/30 active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Cuadro del número de ruta: cuadrado de 48 px con esquinas de 14 px */}
                        <div className="w-[48px] h-[48px] min-w-[48px] rounded-[14px] bg-[#1F4BD8] text-white font-bold text-[16px] flex items-center justify-center shrink-0 shadow-2xs">
                          {routeShortNum}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-bold text-[#0B1B3F] leading-tight">
                              {option.code}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4EBFD] text-[#1F4BD8]">
                              {isDirecta ? 'Directa' : 'Con combinación'}
                            </span>
                          </div>

                          {/* Tiempo grande y en negrita (22 a 26 px negrita) */}
                          <div className="text-[23px] font-bold text-[#0B1B3F] leading-tight mt-0.5">
                            {durationBig}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 p-1 text-[#5B6B8C] group-active:text-[#1F4BD8] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Franja de aviso en la tarjeta si tiene avisos (píldora fondo #FFEDD5, texto #9A3412) */}
                    {hasAlert && (
                      <div className="w-full bg-[#FFEDD5] border border-[#FED7AA] rounded-full px-3 py-1 flex items-center gap-2 text-xs text-[#9A3412]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
                        <span className="font-semibold text-[11px] text-[#9A3412] leading-tight truncate">
                          Aviso de usuarios, {getTimeAgoText(latestAlert)}
                          {extraAlerts > 0 && ` · +${extraAlerts} más`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </section>
          )}
        </div>
      </div>

      {/* Barra de navegación inferior flotante */}
      <BottomTabBar />
    </div>
  );
};
