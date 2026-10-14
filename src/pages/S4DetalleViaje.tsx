import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  MOCK_JOURNEYS,
  KNOWN_PLACES,
  RouteOption,
  INITIAL_ALERT,
  DATA_LAST_UPDATED,
} from '../data/mockData';
import { getAlertsForRoute, getTimeAgoText, formatAlertDateTime } from '../utils/alerts';
import {
  findSavedTrip,
  saveRoute,
  removeSavedRoute,
  isNameTaken,
  getSavedRoutes,
  MAX_SAVED_ROUTES,
  SavedRoute,
} from '../utils/storage';
import {
  AlertTriangle,
  Bookmark,
  Flag,
  Compass,
  Check,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

function formatDuration(text: string): string {
  const clean = text.replace(/^aprox\.?\s*/i, '').trim();
  return `aprox. ${clean}`;
}

const ACTION_CONFIG: Record<string, { label: string; badgeStyle: string }> = {
  sube: { label: 'SUBE', badgeStyle: 'bg-blue-100 text-[#1f5c8b] border-blue-200' },
  viaja: { label: 'VIAJA', badgeStyle: 'bg-emerald-100 text-[#2e7d32] border-emerald-200' },
  transborda: { label: 'TRANSBORDA', badgeStyle: 'bg-amber-100 text-[#b26a00] border-amber-200' },
  bajate: { label: 'BÁJATE', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const SHORTCUT_NAMES = ['Casa', 'Trabajo', 'Estudio'];

export const S4DetalleViaje: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const originId = searchParams.get('o') || '';
  const destId = searchParams.get('d') || '';
  const optionId = searchParams.get('r') || '';

  const [activeTab, setActiveTab] = useState<'pasos' | 'mapa'>('pasos');

  // Estados para guardar y quitar ruta
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

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


  // Estado de ruta guardada sincronizado
  const [savedItem, setSavedItem] = useState<SavedRoute | undefined>(() => {
    if (originId && destId && matchedOption) {
      return findSavedTrip(originId, destId, matchedOption.id);
    }
    return undefined;
  });

  useEffect(() => {
    if (originId && destId && matchedOption) {
      setSavedItem(findSavedTrip(originId, destId, matchedOption.id));
    }
  }, [originId, destId, matchedOption]);

  // Caso: No encontramos este viaje
  if (!matchedOption) {
    return (
      <div className="relative flex flex-col h-full bg-[#f5f7fa]">
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
  const extraAlerts = alerts.length - 1;

  // Pasos de la ruta
  const steps = matchedOption.steps || [];

  const handleOpenSaveSheet = () => {
    setCustomName('');
    setNameError(null);
    setIsSaveSheetOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOption) return;

    const defaultName = `${originName} a ${destName}`;
    const chosenName = customName.trim() || defaultName;

    // Validación 4c: Nombre repetido
    if (isNameTaken(chosenName)) {
      setNameError('Ya tienes una ruta con ese nombre. ¿Quieres usar otro?');
      return;
    }

    const success = saveRoute({
      originId,
      destinationId: destId,
      optionId: matchedOption.id,
      name: chosenName,
    });

    if (success) {
      setSavedItem(findSavedTrip(originId, destId, matchedOption.id));
      setIsSaveSheetOpen(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    }
  };

  const handleConfirmRemove = () => {
    if (savedItem) {
      removeSavedRoute(savedItem.id);
      setSavedItem(undefined);
    }
    setIsConfirmRemoveOpen(false);
  };

  const handleReportProblem = () => {
    const params = new URLSearchParams();
    if (originId) params.set('o', originId);
    if (destId) params.set('d', destId);
    if (matchedOption) params.set('r', matchedOption.id);
    navigate(`/reporte/tipo?${params.toString()}`);
  };

  const totalSavedCount = getSavedRoutes().length;
  const isLimitReached = !savedItem && totalSavedCount >= MAX_SAVED_ROUTES;

  return (
    <div className="relative flex flex-col h-full bg-[#f5f7fa]">
      <TopBar
        title={pageTitle}
        showBack={true}
        backFallback={originId && destId ? `/resultados?o=${originId}&d=${destId}` : '/'}
      />

      {/* Fecha de actualización de datos en letra pequeña debajo de la barra */}
      <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200/80 text-[11px] text-slate-500 font-medium text-center shrink-0">
        Datos al: {DATA_LAST_UPDATED}
      </div>

      {/* Toast breve de 2 segundos "Ruta guardada" */}
      {savedToast && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-[#2e7d32] text-white px-4 py-2.5 rounded-xl text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Ruta guardada</span>
        </div>
      )}

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
                <div className="text-xs leading-snug flex-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                    <span className="font-bold text-[#b26a00]">
                      Reportado por usuarios, {getTimeAgoText(latestAlert)}
                    </span>
                    {extraAlerts > 0 && (
                      <span className="text-[10px] font-bold text-[#b26a00] bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                        +{extraAlerts} aviso{extraAlerts > 1 ? 's' : ''} más
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-slate-900 text-sm leading-snug">
                    {latestAlert.description || (
                      <>
                        {latestAlert.type}
                        {latestAlert.reference ? `: ${latestAlert.reference}` : ''}
                        {latestAlert.comment ? ` (${latestAlert.comment})` : ''}
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-amber-200/70 text-[11px] text-slate-600">
                    <span>
                      Confirmado por {latestAlert.confirmations} persona{latestAlert.confirmations !== 1 ? 's' : ''}
                    </span>
                    {latestAlert.id !== INITIAL_ALERT.id && latestAlert.timestamp && (
                      <span className="text-slate-500">
                        {formatAlertDateTime(latestAlert.timestamp)}
                      </span>
                    )}
                  </div>
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
                  const actionKey = step.action || 'sube';
                  const actionConfig = ACTION_CONFIG[actionKey] || ACTION_CONFIG.sube;
                  const isViaja = actionKey === 'viaja';
                  const referenceText = step.reference || step.instruction;

                  return (
                    <div key={step.order || idx} className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3">
                      {/* Número circular de orden */}
                      <div className="w-7 h-7 rounded-full bg-[#1f5c8b] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.order || idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Etiqueta de acción directamente de action */}
                        <div className="mb-1">
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border tracking-wider ${actionConfig.badgeStyle}`}>
                            {actionConfig.label}
                          </span>
                        </div>

                        {/* Lugar de referencia en letra grande y legible */}
                        <p className="text-base font-bold text-slate-900 leading-snug">
                          {referenceText}
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
            {/* Botón Principal: "Guardar ruta" o "Guardada ✓" */}
            {savedItem ? (
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#2e7d32] text-white font-bold text-sm shadow-md active:bg-[#256628] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Guardada ✓</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenSaveSheet}
                className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md active:bg-[#18496e] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Bookmark className="w-5 h-5 text-blue-200" />
                <span>Guardar ruta</span>
              </button>
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

      {/* G1: HOJA INFERIOR PARA GUARDAR RUTA */}
      <BottomSheet
        isOpen={isSaveSheetOpen}
        onClose={() => setIsSaveSheetOpen(false)}
        title="Guardar esta ruta"
      >
        {isLimitReached ? (
          /* Error 4e: Límite de 10 rutas alcanzado */
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-[#b26a00] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                Puedes guardar hasta 10 rutas. Elimina una para añadir otra.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSaveSheetOpen(false);
                navigate('/mis-rutas');
              }}
              className="w-full touch-target min-h-[48px] py-3 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <span>Ir a Mis rutas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveSubmit} noValidate className="space-y-4">
            {/* Origen y Destino en solo lectura */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Trayecto
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {originName} a {destName}
              </p>
              <p className="text-xs text-[#1f5c8b] font-semibold">
                {matchedOption.code}
              </p>
            </div>

            {/* Campo Nombre */}
            <div className="text-left">
              <label htmlFor="input-save-name" className="block text-sm font-bold text-slate-800 mb-1.5">
                Nombre de la ruta
              </label>
              <input
                id="input-save-name"
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setNameError(null);
                }}
                placeholder={`${originName} a ${destName}`}
                className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl border text-[16px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                  nameError
                    ? 'border-[#b3382c] bg-red-50/20 focus:border-[#b3382c]'
                    : 'border-slate-300 focus:border-[#1f5c8b]'
                }`}
              />

              {/* Error 4c: Nombre repetido */}
              {nameError && (
                <div className="mt-1.5 text-xs text-[#b3382c] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Línea de Atajos: Casa, Trabajo, Estudio (mínimo 40 px) */}
            <div className="text-left pt-1">
              <span className="text-xs font-semibold text-slate-600 mb-2 block">
                Atajos:
              </span>
              <div className="flex flex-wrap gap-2">
                {SHORTCUT_NAMES.map((shortcut) => (
                  <button
                    key={shortcut}
                    type="button"
                    onClick={() => {
                      setCustomName(shortcut);
                      setNameError(null);
                    }}
                    className="touch-target min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    {shortcut}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones Guardar y Cancelar (48 px) */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-sm shadow-md active:bg-[#18496e] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Guardar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveSheetOpen(false)}
                className="w-full touch-target min-h-[48px] py-3 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm active:bg-slate-50 transition-all flex items-center justify-center"
              >
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* DIÁLOGO CONFIRMAR QUITAR RUTA DE MIS RUTAS */}
      <ConfirmDialog
        isOpen={isConfirmRemoveOpen}
        onClose={() => setIsConfirmRemoveOpen(false)}
        onConfirm={handleConfirmRemove}
        title="¿Quitar esta ruta de Mis rutas?"
        message="Podrás volver a guardarla cuando quieras desde los resultados de búsqueda."
        confirmText="Quitar"
        cancelText="Cancelar"
        isDestructive={true}
      />

      <BottomTabBar />
    </div>
  );
};
