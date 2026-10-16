import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MOCK_JOURNEYS, KNOWN_PLACES, RouteOption } from '../data/mockData';
import { getAlertsForRoute } from '../utils/alerts';
import {
  getSavedRoutes,
  removeSavedRoute,
  renameRoute,
  isNameTaken,
  SavedRoute,
} from '../utils/storage';
import {
  Bookmark,
  MoreVertical,
  Plus,
  AlertTriangle,
  Pencil,
  RotateCcw,
  Trash2,
  ChevronRight,
  AlertCircle,
  Search,
  Check
} from 'lucide-react';

function formatDuration(text: string): string {
  const clean = text.replace(/^aprox\.?\s*/i, '').trim();
  return `aprox. ${clean}`;
}

export const G2MisRutas: React.FC = () => {
  const navigate = useNavigate();

  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [activeMenuRoute, setActiveMenuRoute] = useState<SavedRoute | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<SavedRoute | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cargar rutas guardadas
  const refreshRoutes = () => {
    setSavedRoutes(getSavedRoutes());
  };

  useEffect(() => {
    refreshRoutes();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenSearchNew = () => {
    try {
      sessionStorage.removeItem('rutea_s2_origin');
      sessionStorage.removeItem('rutea_s2_dest');
    } catch {
      // ignore
    }
    navigate('/buscar');
  };

  // Encontrar opción en los datos actuales
  const findOptionForRoute = (item: SavedRoute): RouteOption | undefined => {
    for (const journey of MOCK_JOURNEYS) {
      if (journey.originId === item.originId && journey.destinationId === item.destinationId) {
        const opt = journey.options.find((o) => o.id === item.optionId);
        if (opt) return opt;
      }
    }
    // Fallback general por id de opción
    for (const journey of MOCK_JOURNEYS) {
      const opt = journey.options.find((o) => o.id === item.optionId);
      if (opt) return opt;
    }
    return undefined;
  };

  const handleCardClick = (item: SavedRoute, optionAvailable: boolean) => {
    if (!optionAvailable) {
      // A4: Ruta ya no disponible
      showToast('Prueba con una búsqueda nueva');
      setTimeout(() => {
        navigate('/buscar');
      }, 700);
      return;
    }

    // Tocar la tarjeta abre S4 sin volver a buscar
    navigate(`/detalle?o=${encodeURIComponent(item.originId)}&d=${encodeURIComponent(item.destinationId)}&r=${encodeURIComponent(item.optionId)}`);
  };

  // Abrir menú de opciones G3
  const handleOpenMenu = (e: React.MouseEvent, item: SavedRoute) => {
    e.stopPropagation();
    setActiveMenuRoute(item);
  };

  // Iniciar cambio de nombre
  const handleStartRename = () => {
    if (!activeMenuRoute) return;
    setRenameValue(activeMenuRoute.name);
    setRenameError(null);
    setIsRenameOpen(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenuRoute) return;

    const newName = renameValue.trim() || activeMenuRoute.name;

    // Validación 4c: Nombre repetido
    if (isNameTaken(newName, activeMenuRoute.id)) {
      setRenameError('Ya tienes una ruta con ese nombre. ¿Quieres usar otro?');
      return;
    }

    renameRoute(activeMenuRoute.id, newName);
    refreshRoutes();
    setIsRenameOpen(false);
    setActiveMenuRoute(null);
    showToast('Nombre actualizado');
  };

  // Buscar de nuevo (hoy)
  const handleSearchAgain = () => {
    if (!activeMenuRoute) return;
    const { originId, destinationId } = activeMenuRoute;
    setActiveMenuRoute(null);
    navigate(`/resultados?o=${encodeURIComponent(originId)}&d=${encodeURIComponent(destinationId)}`);
  };

  // Iniciar eliminación
  const handleStartDelete = () => {
    if (!activeMenuRoute) return;
    setRouteToDelete(activeMenuRoute);
    setActiveMenuRoute(null);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (routeToDelete) {
      removeSavedRoute(routeToDelete.id);
      refreshRoutes();
      showToast('Ruta quitada de Mis rutas');
    }
    setIsConfirmDeleteOpen(false);
    setRouteToDelete(null);
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
      <TopBar title="Mis rutas" showBack={false} />

      {/* Toast informativo */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-[#0B1B3F] text-white px-4 py-3 rounded-[22px] text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        {/* ESTADO VACÍO (4a) */}
        {savedRoutes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-16 h-16 rounded-[16px] bg-[#E4EBFD] text-[#1F4BD8] flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 stroke-[2.25]" />
            </div>

            <h2 className="text-[20px] font-bold text-[#0B1B3F] mb-2 leading-snug">
              Aquí aparecerán tus viajes de siempre
            </h2>

            <p className="text-[13px] text-[#5B6B8C] max-w-xs mb-6 leading-relaxed">
              Guarda tus rutas frecuentes para consultarlas rápidamente con un solo toque.
            </p>

            <button
              type="button"
              onClick={handleOpenSearchNew}
              className="w-full max-w-xs touch-target min-h-[48px] px-6 py-3.5 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 stroke-[2.25]" />
              <span>Buscar una ruta</span>
            </button>
          </div>
        ) : (
          /* LISTA DE RUTAS GUARDADAS */
          <div className="space-y-4">
            <div className="space-y-3" role="list" aria-label="Rutas guardadas">
              {savedRoutes.map((item) => {
                const originPlace = KNOWN_PLACES.find((p) => p.id === item.originId);
                const destPlace = KNOWN_PLACES.find((p) => p.id === item.destinationId);
                const originName = originPlace ? originPlace.name : 'Origen';
                const destName = destPlace ? destPlace.name : 'Destino';

                const option = findOptionForRoute(item);
                const isAvailable = Boolean(option);
                const routeShortNum = option ? option.code.replace(/^Ruta\s*/i, '').trim() : 'R';

                // Avisos recientes para esta ruta si está disponible
                const alerts = isAvailable && option ? getAlertsForRoute(option.code) : [];
                const hasAlert = alerts.length > 0;
                const alertText =
                  alerts.length === 1 ? '1 aviso reciente' : `${alerts.length} avisos recientes`;

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(item, isAvailable)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCardClick(item, isAvailable);
                      }
                    }}
                    className="w-full touch-target min-h-[64px] bg-[#F2F5FB] rounded-[22px] p-4 border border-[#E3E8F4] text-left flex flex-col justify-between gap-2.5 active:bg-[#E4EBFD]/30 transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Cuadro del número de ruta: cuadrado de 46-50 px con esquinas de 14 px */}
                        <div className="w-[48px] h-[48px] min-w-[48px] rounded-[14px] bg-[#1F4BD8] text-white font-bold text-[16px] flex items-center justify-center shrink-0">
                          {routeShortNum}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Nombre de la ruta en negrita */}
                          <h3 className="text-base font-bold text-[#0B1B3F] leading-snug truncate">
                            {item.name}
                          </h3>

                          {/* "Origen a Destino" con nombres reales */}
                          <p className="text-[13px] text-[#5B6B8C] font-medium mt-0.5 truncate">
                            {originName} a {destName}
                          </p>

                          {/* Código de ruta y tiempo o mensaje de no disponible */}
                          {isAvailable && option ? (
                            <p className="text-xs text-[#1F4BD8] font-bold mt-1">
                              {option.code} · {formatDuration(option.durationText)}
                            </p>
                          ) : (
                            <p className="text-xs text-[#B42318] font-semibold mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Esta ruta ya no está disponible</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botón de menú con tres puntos */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenMenu(e, item)}
                        aria-label={`Opciones para ${item.name}`}
                        className="touch-target min-w-[48px] min-h-[48px] -mr-2 flex items-center justify-center text-[#5B6B8C] active:text-[#0B1B3F] rounded-full"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Franja de aviso en píldora si existe aviso reciente */}
                    {hasAlert && (
                      <div className="w-full bg-[#FFEDD5] border border-[#FED7AA] rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-[#9A3412] mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-[#9A3412] shrink-0" />
                        <span className="font-bold text-[11px] text-[#9A3412]">
                          {alertText}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón secundario al pie: "+ Buscar otra ruta" */}
            <div className="pt-2 pb-4">
              <button
                type="button"
                onClick={handleOpenSearchNew}
                className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-[22px] bg-[#E4EBFD] text-[#1F4BD8] font-bold text-sm active:bg-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.25]" />
                <span>Buscar otra ruta</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* G3: HOJA DE OPCIONES DE UNA RUTA */}
      <BottomSheet
        isOpen={Boolean(activeMenuRoute)}
        onClose={() => setActiveMenuRoute(null)}
        title={activeMenuRoute?.name || 'Opciones de ruta'}
      >
        <div className="space-y-2.5 py-1" role="menu">
          {/* Opción 1: Cambiar nombre */}
          <button
            type="button"
            role="menuitem"
            onClick={handleStartRename}
            className="w-full touch-target min-h-[56px] px-4 py-3 rounded-[22px] bg-[#F2F5FB] hover:bg-[#E4EBFD]/30 active:bg-[#E4EBFD]/50 text-[#0B1B3F] font-bold text-sm flex items-center justify-between border border-[#E3E8F4] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Pencil className="w-5 h-5 text-[#1F4BD8]" />
              <span>Cambiar nombre</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5B6B8C]" />
          </button>

          {/* Opción 2: Buscar de nuevo (hoy) */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSearchAgain}
            className="w-full touch-target min-h-[56px] px-4 py-3 rounded-[22px] bg-[#F2F5FB] hover:bg-[#E4EBFD]/30 active:bg-[#E4EBFD]/50 text-[#0B1B3F] font-bold text-sm flex items-center justify-between border border-[#E3E8F4] transition-colors"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-[#1F4BD8]" />
              <span>Buscar de nuevo (hoy)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5B6B8C]" />
          </button>

          {/* Opción 3: Eliminar (en rojo) */}
          <button
            type="button"
            role="menuitem"
            onClick={handleStartDelete}
            className="w-full touch-target min-h-[56px] px-4 py-3 rounded-[22px] bg-red-50/50 hover:bg-red-50 active:bg-red-100 text-[#B42318] font-bold text-sm flex items-center justify-between border border-red-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-[#B42318]" />
              <span>Eliminar</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#B42318]" />
          </button>
        </div>
      </BottomSheet>

      {/* HOJA PARA CAMBIAR NOMBRE */}
      <BottomSheet
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Cambiar nombre de la ruta"
      >
        <form onSubmit={handleSaveRename} noValidate className="space-y-4">
          <div className="text-left">
            <label htmlFor="input-rename" className="block text-sm font-bold text-[#0B1B3F] mb-1.5">
              Nuevo nombre
            </label>
            <input
              id="input-rename"
              type="text"
              value={renameValue}
              onChange={(e) => {
                setRenameValue(e.target.value);
                setRenameError(null);
              }}
              className={`w-full min-h-[48px] px-4 py-3 rounded-[22px] border text-[16px] text-[#0B1B3F] bg-white focus:outline-none transition-colors ${
                renameError
                  ? 'border-[#B42318] bg-red-50/20 focus:border-[#B42318]'
                  : 'border-[#E3E8F4] focus:border-[#1F4BD8]'
              }`}
            />

            {renameError && (
              <div className="mt-1.5 text-xs text-[#B42318] flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{renameError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRenameOpen(false)}
              className="w-full touch-target min-h-[48px] py-3 px-4 rounded-[22px] bg-[#F2F5FB] border border-[#E3E8F4] text-[#5B6B8C] font-bold text-sm active:bg-[#E4EBFD]/50 transition-all flex items-center justify-center"
            >
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* DIÁLOGO CONFIRMAR ELIMINAR RUTA */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Quitar esta ruta de Mis rutas?"
        message={routeToDelete ? `Se eliminará "${routeToDelete.name}" de tus rutas guardadas.` : undefined}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDestructive={true}
      />

      <BottomTabBar />
    </div>
  );
};
