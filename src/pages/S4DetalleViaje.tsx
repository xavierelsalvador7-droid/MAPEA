import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { MOCK_JOURNEYS, KNOWN_PLACES, RouteOption } from '../data/mockData';
import { getAlertsForRoute } from '../utils/alerts';
import {
  AlertTriangle,
  Bookmark,
  Flag,
  MapPin,
  Clock,
  Compass,
  ArrowLeft,
  Navigation
} from 'lucide-react';

function formatDuration(text: string): string {
  const clean = text.replace(/^aprox\.?\s*/i, '').trim();
  return `aprox. ${clean}`;
}

export const S4DetalleViaje: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const originId = searchParams.get('o') || '';
  const destId = searchParams.get('d') || '';
  const optionId = searchParams.get('r') || '';

  const [activeTab, setActiveTab] = useState<'pasos' | 'mapa'>('pasos');
  const [saveMessageVisible, setSaveMessageVisible] = useState(false);

  // Buscar el trayecto y la opción seleccionada
  let matchedOption: RouteOption | undefined;
  let originName = '';
  let destName = '';

  const originPlace = KNOWN_PLACES.find((p) => p.id === originId);
  const destPlace = KNOWN_PLACES.find((p) => p.id === destId);

  if (originPlace) originName = originPlace.name;
  if (destPlace) destName = destPlace.name;

  // Buscar en todos los trayectos por si r coincide
  for (const journey of MOCK_JOURNEYS) {
    if ((!originId || journey.originId === originId) && (!destId || journey.destinationId === destId)) {
      const found = journey.options.find((opt) => opt.id === optionId);
      if (found) {
        matchedOption = found;
        if (!originName) {
          const orig = KNOWN_PLACES.find((p) => p.id === journey.originId);
          if (orig) originName = orig.name;
        }
        if (!destName) {
          const dst = KNOWN_PLACES.find((p) => p.id === journey.destinationId);
          if (dst) destName = dst.name;
        }
        break;
      }
    }
  }

  // Si no se pasó r o se abrió directamente como ejemplo (por ej. desde G2)
  if (!matchedOption && optionId) {
    for (const journey of MOCK_JOURNEYS) {
      const found = journey.options.find((opt) => opt.id === optionId);
      if (found) {
        matchedOption = found;
        break;
      }
    }
  }

  // Si aún no hay opción pero vino desde G2 como ejemplo general, tomar la primera opción de MOCK_JOURNEYS
  if (!matchedOption && !optionId && MOCK_JOURNEYS.length > 0) {
    matchedOption = MOCK_JOURNEYS[0].options[0];
    const orig = KNOWN_PLACES.find((p) => p.id === MOCK_JOURNEYS[0].originId);
    const dst = KNOWN_PLACES.find((p) => p.id === MOCK_JOURNEYS[0].destinationId);
    if (orig) originName = orig.name;
    if (dst) destName = dst.name;
  }

  // Caso: No encontramos este viaje
  if (!matchedOption) {
    return (
      <div className="flex flex-col h-full bg-[#f5f7fa]">
        <TopBar title="Detalle del viaje" showBack={true} backFallback="/resultados" />
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b26a00] mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            No encontramos este viaje
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mb-6">
            La ruta solicitada no está disponible o los parámetros son inválidos.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="touch-target px-6 py-3 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md active:bg-[#18496e] transition-colors"
          >
            Volver a Inicio
          </button>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  // Título de la cabecera: "Ruta 26 (aprox. 55 min)"
  const pageTitle = `${matchedOption.code} (${formatDuration(matchedOption.durationText)})`;

  // Avisos recientes de la ruta
  const alerts = getAlertsForRoute(matchedOption.code);
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  // Pasos de la ruta
  const steps = matchedOption.steps || [];

  const handleSaveRoute = () => {
    setSaveMessageVisible(true);
  };

  const handleReportProblem = () => {
    const params = new URLSearchParams();
    if (originId) params.set('o', originId);
    if (destId) params.set('d', destId);
    if (matchedOption) params.set('r', matchedOption.id);
    navigate(`/reporte/tipo?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar
        title={pageTitle}
        showBack={true}
        backFallback={originId && destId ? `/resultados?o=${originId}&d=${destId}` : '/'}
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Banner de aviso arriba de las pestañas (si hay aviso reciente) */}
          {latestAlert && (
            <aside
              aria-label="Aviso reciente de la ruta"
              className="bg-[#fff4cc] border border-[#e0b400] rounded-2xl p-3.5 shadow-sm text-slate-800"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#b26a00] shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold text-[#b26a00] mr-1">
                    Aviso {latestAlert.reportedTimeAgo}:
                  </span>
                  <span className="font-medium text-slate-900">
                    {latestAlert.description}
                  </span>
                </div>
              </div>
            </aside>
          )}

          {/* Selector de pestañas: "Pasos" y "Mapa" (Altura mínima 48 px) */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pasos'}
              onClick={() => setActiveTab('pasos')}
              className={`flex-1 touch-target min-h-[48px] py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pasos'
                  ? 'bg-white text-[#1f5c8b] shadow-sm'
                  : 'text-slate-600 active:text-slate-900'
              }`}
            >
              <span>Pasos</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'mapa'}
              onClick={() => setActiveTab('mapa')}
              className={`flex-1 touch-target min-h-[48px] py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'mapa'
                  ? 'bg-white text-[#1f5c8b] shadow-sm'
                  : 'text-slate-600 active:text-slate-900'
              }`}
            >
              <span>Mapa</span>
            </button>
          </div>

          {/* CONTENIDO PESTAÑA: PASOS */}
          {activeTab === 'pasos' && (
            <section aria-label="Instrucciones paso a paso" className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm divide-y divide-slate-100">
                {steps.map((step, idx) => {
                  const norm = step.instruction.toLowerCase().trim();
                  
                  // Verbo de acción
                  let actionBadge = 'SUBE';
                  let badgeStyle = 'bg-blue-100 text-[#1f5c8b] border-blue-200';

                  if (norm.startsWith('viaja')) {
                    actionBadge = 'VIAJA';
                    badgeStyle = 'bg-emerald-100 text-[#2e7d32] border-emerald-200';
                  } else if (norm.startsWith('transborda') || norm.startsWith('cambia')) {
                    actionBadge = 'TRANSBORDA';
                    badgeStyle = 'bg-amber-100 text-[#b26a00] border-amber-200';
                  } else if (norm.startsWith('bájate') || norm.startsWith('bajate') || norm.startsWith('llega')) {
                    actionBadge = 'BÁJATE';
                    badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
                  }

                  // Extracción de la referencia principal (grande) y técnica (pequeña)
                  let reference = step.instruction;
                  let isViaja = actionBadge === 'VIAJA';

                  if (isViaja) {
                    // En el paso VIAJA muestra el tiempo "aprox. 40 min" y en pequeño el detalle
                    const matchTime = step.instruction.match(/viaja\s+(aprox\.?\s*[^,]+)/i);
                    reference = matchTime ? matchTime[1] : step.instruction;
                  } else {
                    // Quitar el verbo inicial para resaltar la referencia conocida
                    const stripped = step.instruction.replace(/^(sube|aborda\s+la\s+unidad\s+en\s+la|aborda|toma\s+unidad\s+de\s+enlace\s+hacia|toma|transborda\s+a\s+la|transborda|bájate|bajate|llega\s+al|llega\s+a)\s+/i, '');
                    reference = stripped.charAt(0).toUpperCase() + stripped.slice(1);
                  }

                  return (
                    <div key={step.order || idx} className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3">
                      {/* Número circular de orden */}
                      <div className="w-7 h-7 rounded-full bg-[#1f5c8b] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.order || idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Etiqueta de acción */}
                        <div className="mb-1">
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border tracking-wider ${badgeStyle}`}>
                            {actionBadge}
                          </span>
                        </div>

                        {/* Lugar de referencia en letra grande y legible */}
                        <p className="text-base font-bold text-slate-900 leading-snug">
                          {reference}
                        </p>

                        {/* En el paso VIAJA: detalle en pequeño */}
                        {isViaja && step.details && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {step.details}
                          </p>
                        )}

                        {/* En otros pasos: Parada técnica en pequeño si existe */}
                        {!isViaja && step.stopName && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug font-medium">
                            Parada: <span className="text-slate-600">{step.stopName}</span>
                          </p>
                        )}

                        {!isViaja && step.details && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                            {step.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CONTENIDO PESTAÑA: MAPA */}
          {activeTab === 'mapa' && (
            <section aria-label="Mapa ilustrativo" className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center">
                {/* SVG Ilustrativo del recorrido */}
                <div className="relative w-full h-56 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <svg viewBox="0 0 340 220" className="w-full h-full object-cover">
                    <rect width="340" height="220" fill="#f8fafc" />
                    
                    {/* Cuadrícula suave de referencia */}
                    <path d="M 0 55 L 340 55 M 0 110 L 340 110 M 0 165 L 340 165" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 85 0 L 85 220 M 170 0 L 170 220 M 255 0 L 255 220" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Sombra de la ruta */}
                    <path
                      d="M 50 160 C 110 160, 140 70, 290 70"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* Línea principal de transporte */}
                    <path
                      d="M 50 160 C 110 160, 140 70, 290 70"
                      fill="none"
                      stroke="#1f5c8b"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Punto de Origen */}
                    <circle cx="50" cy="160" r="8" fill="#1f5c8b" />
                    <circle cx="50" cy="160" r="4" fill="#ffffff" />
                    <rect x="15" y="176" width="100" height="26" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <text x="65" y="193" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                      {originName ? (originName.length > 14 ? originName.slice(0, 14) + '...' : originName) : 'Origen'}
                    </text>

                    {/* Punto intermedio con badge de ruta */}
                    <circle cx="170" cy="115" r="5" fill="#e0b400" stroke="#ffffff" strokeWidth="2" />
                    <rect x="135" y="90" width="70" height="18" rx="4" fill="#1f5c8b" />
                    <text x="170" y="103" fontSize="9" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                      {matchedOption.code}
                    </text>

                    {/* Punto de Destino */}
                    <circle cx="290" cy="70" r="8" fill="#2e7d32" />
                    <circle cx="290" cy="70" r="4" fill="#ffffff" />
                    <rect x="225" y="24" width="105" height="26" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <text x="277" y="41" fontSize="10" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                      {destName ? (destName.length > 15 ? destName.slice(0, 15) + '...' : destName) : 'Destino'}
                    </text>
                  </svg>
                </div>

                {/* Leyenda requerida: "Mapa ilustrativo. No muestra tu ubicación ni tiempo real." */}
                <p className="text-xs text-slate-500 font-medium text-center mt-3 leading-normal">
                  Mapa ilustrativo. No muestra tu ubicación ni tiempo real.
                </p>
              </div>
            </section>
          )}

          {/* DOS BOTONES AL FINAL DEL CONTENIDO (No fijos, mínimo 48 px) */}
          <div className="pt-2 pb-6 space-y-2.5">
            {/* Botón Principal: Guardar ruta */}
            <button
              type="button"
              onClick={handleSaveRoute}
              className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md active:bg-[#18496e] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Bookmark className="w-5 h-5 text-blue-200" />
              <span>Guardar ruta</span>
            </button>

            {/* Mensaje breve al pulsar Guardar ruta */}
            {saveMessageVisible && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-center text-xs text-[#1f5c8b] font-medium animate-fadeIn">
                Esta función se activa en la siguiente parte.
              </div>
            )}

            {/* Botón Secundario: Reportar un problema */}
            <button
              type="button"
              onClick={handleReportProblem}
              className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-white text-slate-800 border-2 border-slate-200 font-bold text-sm active:bg-slate-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Flag className="w-4 h-4 text-[#b26a00]" />
              <span>Reportar un problema</span>
            </button>
          </div>

        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
