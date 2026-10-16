import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BottomTabBar } from '../components/BottomTabBar';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MapaReferencia } from '../components/MapaReferencia';
import {
  MOCK_JOURNEYS,
  KNOWN_PLACES,
  RouteOption,
  INITIAL_ALERT,
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
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

function formatDuration(text: string): string {
  const clean = text.replace(/^aprox\.?\s*/i, '').trim();
  return `aprox. ${clean}`;
}

const ACTION_CONFIG: Record<string, { label: string }> = {
  sube: { label: 'SUBE' },
  viaja: { label: 'VIAJA' },
  transborda: { label: 'TRANSBORDA' },
  bajate: { label: 'BÁJATE' },
};

const SHORTCUT_NAMES = ['Casa', 'Trabajo', 'Estudio'];

export const S4DetalleViaje: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const originId = searchParams.get('o') || '';
  const destId = searchParams.get('d') || '';
  const optionId = searchParams.get('r') || '';

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

  // Caso: No encontramos este viaje (sin r válido)
  if (!matchedOption) {
    return (
      <div className="relative flex flex-col h-full bg-white">
        <div className="p-4 flex items-center gap-2 border-b border-[#E3E8F4]">
          <button
            onClick={() => navigate('/')}
            type="button"
            aria-label="Regresar"
            className="touch-target min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#0B1B3F]"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#0B1B3F]">Detalle del viaje</h1>
        </div>
        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-[22px] bg-[#E4EBFD] text-[#1F4BD8] flex items-center justify-center mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-[20px] font-bold text-[#0B1B3F] mb-2">
            No encontramos este viaje
          </h2>
          <p className="text-[13px] text-[#5B6B8C] max-w-xs mb-6">
            La ruta solicitada no está disponible o los parámetros son inválidos.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="touch-target min-h-[48px] px-6 py-3 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 transition-colors"
          >
            Volver a Inicio
          </button>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  // Título de la barra flotante: "Ruta X · aprox. N min"
  const floatingTitle = `${matchedOption.code} · ${formatDuration(matchedOption.durationText)}`;

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

  const handleBack = () => {
    if (originId && destId) {
      navigate(`/resultados?o=${encodeURIComponent(originId)}&d=${encodeURIComponent(destId)}`);
    } else {
      navigate(-1);
    }
  };

  const totalSavedCount = getSavedRoutes().length;
  const isLimitReached = !savedItem && totalSavedCount >= MAX_SAVED_ROUTES;

  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      {/* Toast breve de 2 segundos "Ruta guardada" */}
      {savedToast && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-[#0B1B3F] text-white px-4 py-3 rounded-[22px] text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Ruta guardada</span>
        </div>
      )}

      {/* 1. MAPA ARRIBA SIEMPRE VISIBLE CON RUTA */}
      <div className="relative w-full h-[220px] shrink-0 bg-[#EAEFF7]">
        <MapaReferencia
          mostrarRuta={true}
          className="w-full h-full"
        />

        {/* Barra flotante blanca encima del mapa: Flecha atrás y Ruta X · aprox. N min */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-[22px] px-2.5 py-1.5 shadow-[0_2px_12px_rgba(11,27,63,0.08)] border border-[#E3E8F4]">
          <button
            onClick={handleBack}
            type="button"
            aria-label="Regresar"
            className="touch-target min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#0B1B3F] active:bg-[#F2F5FB] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </button>

          <div className="min-w-0 flex-1 pr-3">
            <p className="text-[14px] font-bold text-[#0B1B3F] truncate leading-tight">
              {floatingTitle}
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
          {/* Banner de aviso arriba de los pasos (si hay aviso reciente) */}
          {latestAlert && (
            <aside
              aria-label="Aviso reciente de la ruta"
              className="bg-[#FFEDD5] border border-[#FED7AA] rounded-[22px] p-3.5 text-[#9A3412]"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#9A3412] shrink-0 mt-0.5" />
                <div className="text-xs leading-snug flex-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                    <span className="font-bold text-[#9A3412]">
                      Reportado por usuarios, {getTimeAgoText(latestAlert)}
                    </span>
                    {extraAlerts > 0 && (
                      <span className="text-[10px] font-bold text-[#9A3412] bg-white px-2 py-0.5 rounded-full border border-[#FED7AA]">
                        +{extraAlerts} más
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-[#0B1B3F] text-[13px] leading-snug">
                    {latestAlert.description || (
                      <>
                        {latestAlert.type}
                        {latestAlert.reference ? `: ${latestAlert.reference}` : ''}
                        {latestAlert.comment ? ` (${latestAlert.comment})` : ''}
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[#FED7AA]/60 text-[11px] text-[#9A3412]/80">
                    <span>
                      Confirmado por {latestAlert.confirmations} persona{latestAlert.confirmations !== 1 ? 's' : ''}
                    </span>
                    {latestAlert.id !== INITIAL_ALERT.id && latestAlert.timestamp && (
                      <span>
                        {formatAlertDateTime(latestAlert.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* LISTA DE PASOS */}
          <section aria-label="Instrucciones paso a paso">
            <div className="bg-[#F2F5FB] rounded-[22px] p-4 border border-[#E3E8F4] divide-y divide-[#E3E8F4]">
              {steps.map((step, idx) => {
                const actionKey = step.action || 'sube';
                const actionConfig = ACTION_CONFIG[actionKey] || ACTION_CONFIG.sube;
                const isViaja = actionKey === 'viaja';
                const referenceText = step.reference || step.instruction;

                return (
                  <div key={step.order || idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    {/* Número circular azul */}
                    <div className="w-7 h-7 rounded-full bg-[#1F4BD8] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {step.order || idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Etiqueta de acción en azul suave */}
                      <div className="mb-1">
                        <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider bg-[#E4EBFD] text-[#1F4BD8]">
                          {actionConfig.label}
                        </span>
                      </div>

                      {/* Lugar de referencia en letra grande y legible */}
                      <p className="text-[15px] font-bold text-[#0B1B3F] leading-snug break-words">
                        {referenceText}
                      </p>

                      {/* Detalle o parada técnica en pequeño */}
                      {isViaja && step.details && (
                        <p className="text-[13px] text-[#5B6B8C] mt-0.5 leading-snug break-words">
                          {step.details}
                        </p>
                      )}

                      {!isViaja && step.stopName && (
                        <p className="text-[13px] text-[#5B6B8C] mt-0.5 leading-snug font-medium break-words">
                          Parada: <span className="text-[#0B1B3F]">{step.stopName}</span>
                        </p>
                      )}

                      {!isViaja && step.details && (
                        <p className="text-[12px] text-[#5B6B8C] mt-0.5 leading-tight break-words">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BOTONES "Guardar ruta" y "Reportar" EN UNA FILA */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 pb-3">
            {/* Botón Guardar ruta (azul) */}
            {savedItem ? (
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                className="w-full touch-target min-h-[48px] py-3 px-3 rounded-[22px] bg-[#E4EBFD] text-[#1F4BD8] border border-[#1F4BD8]/30 font-bold text-[13px] active:bg-blue-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span className="truncate">Guardada ✓</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenSaveSheet}
                className="w-full touch-target min-h-[48px] py-3 px-3 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-[13px] active:bg-blue-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Bookmark className="w-4 h-4" />
                <span className="truncate">Guardar ruta</span>
              </button>
            )}

            {/* Botón Reportar (azul suave) */}
            <button
              type="button"
              onClick={handleReportProblem}
              className="w-full touch-target min-h-[48px] py-3 px-3 rounded-[22px] bg-[#E4EBFD] text-[#1F4BD8] font-bold text-[13px] active:bg-blue-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Flag className="w-4 h-4 stroke-[2.25]" />
              <span className="truncate">Reportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* G1: HOJA INFERIOR PARA GUARDAR RUTA */}
      <BottomSheet
        isOpen={isSaveSheetOpen}
        onClose={() => setIsSaveSheetOpen(false)}
        title="Guardar esta ruta"
      >
        {isLimitReached ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFEDD5] text-[#9A3412] flex items-center justify-center mx-auto border border-[#FED7AA]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B1B3F] leading-snug">
                Puedes guardar hasta 10 rutas. Elimina una para añadir otra.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSaveSheetOpen(false);
                navigate('/mis-rutas');
              }}
              className="w-full touch-target min-h-[48px] py-3 px-4 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 flex items-center justify-center gap-2"
            >
              <span>Ir a Mis rutas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveSubmit} noValidate className="space-y-4">
            {/* Trayecto */}
            <div className="p-3.5 bg-[#F2F5FB] rounded-[18px] border border-[#E3E8F4] text-left space-y-1">
              <span className="text-[11px] font-bold text-[#5B6B8C] uppercase tracking-wider block">
                Trayecto
              </span>
              <p className="text-sm font-bold text-[#0B1B3F] leading-snug">
                {originName} a {destName}
              </p>
              <p className="text-xs text-[#1F4BD8] font-bold">
                {matchedOption.code}
              </p>
            </div>

            {/* Campo Nombre */}
            <div className="text-left">
              <label htmlFor="input-save-name" className="block text-sm font-bold text-[#0B1B3F] mb-1.5">
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
                className={`w-full min-h-[48px] px-4 py-3 rounded-[22px] border text-[16px] text-[#0B1B3F] bg-white placeholder:text-[#5B6B8C] focus:outline-none transition-colors ${
                  nameError
                    ? 'border-[#B42318] bg-red-50/20 focus:border-[#B42318]'
                    : 'border-[#E3E8F4] focus:border-[#1F4BD8]'
                }`}
              />

              {/* Error 4c: Nombre repetido */}
              {nameError && (
                <div className="mt-1.5 text-xs text-[#B42318] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Atajos */}
            <div className="text-left pt-1">
              <span className="text-xs font-semibold text-[#5B6B8C] mb-2 block">
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
                    className="touch-target min-h-[40px] px-4 py-2 rounded-full bg-[#E4EBFD] text-[#1F4BD8] text-xs font-bold active:bg-blue-100 transition-colors"
                  >
                    {shortcut}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones Guardar y Cancelar */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Guardar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveSheetOpen(false)}
                className="w-full touch-target min-h-[48px] py-3 px-4 rounded-[22px] bg-[#F2F5FB] border border-[#E3E8F4] text-[#5B6B8C] font-bold text-sm active:bg-[#E4EBFD]/50 transition-all flex items-center justify-center"
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

      {/* Barra de navegación inferior flotante */}
      <BottomTabBar />
    </div>
  );
};
