import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  AlertTriangle,
  Download,
  X,
  Clock
} from 'lucide-react';
import { BottomTabBar } from '../components/BottomTabBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MapaReferencia } from '../components/MapaReferencia';
import { INITIAL_ALERT } from '../data/mockData';
import { getTimeAgoText } from '../utils/alerts';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const S1Inicio: React.FC = () => {
  const navigate = useNavigate();
  const { isInstallable, install } = usePWAInstall();
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const tapTimestampsRef = useRef<number[]>([]);

  // Detectar si venimos de /reiniciar
  useEffect(() => {
    try {
      if (sessionStorage.getItem('rutea_reset_notice') === 'true') {
        sessionStorage.removeItem('rutea_reset_notice');
        setAlertDismissed(false);
        setResetToast(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Timer para ocultar el aviso de 3 segundos
  useEffect(() => {
    if (!resetToast) return;
    const timer = setTimeout(() => {
      setResetToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [resetToast]);

  // Al entrar a S1 (Inicio) borra las claves de sessionStorage para búsqueda nueva
  useEffect(() => {
    try {
      sessionStorage.removeItem('rutea_s2_origin');
      sessionStorage.removeItem('rutea_s2_dest');
    } catch {
      // ignore
    }
  }, []);

  // Acceso oculto: 5 toques en 3 segundos al pie
  const handleFooterTap = () => {
    const now = Date.now();
    const recent = tapTimestampsRef.current.filter((t) => now - t <= 3000);
    recent.push(now);
    tapTimestampsRef.current = recent;
    if (recent.length >= 5) {
      tapTimestampsRef.current = [];
      setShowResetConfirm(true);
    }
  };

  const executeReset = () => {
    try {
      localStorage.removeItem('rutea_alerts_v1');
      localStorage.removeItem('rutea_confirmations_v1');
      localStorage.removeItem('rutea_saved_routes_v2');
      sessionStorage.removeItem('rutea_s2_origin');
      sessionStorage.removeItem('rutea_s2_dest');
    } catch (e) {
      console.warn('Error al restablecer datos de prueba:', e);
    }
    setAlertDismissed(false);
    setShowResetConfirm(false);
    setResetToast(true);
  };

  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      {/* Aviso breve de restablecimiento (3 segundos) */}
      {resetToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-4 left-4 right-4 z-50 bg-[#0B1B3F] text-white px-4 py-3 rounded-[22px] text-center text-xs font-bold shadow-lg flex items-center justify-center gap-2 animate-fadeIn"
        >
          <span>Datos de prueba restablecidos</span>
        </div>
      )}

      {/* Contenido principal superior (sin scroll) */}
      <div className="px-[18px] pt-4 pb-2 space-y-3 shrink-0">
        {/* Cabecera con Logo "RUTEA" */}
        <header className="flex items-center justify-between">
          <span className="text-[16px] font-extrabold tracking-[0.2em] text-[#1F4BD8] uppercase">
            RUTEA
          </span>

          {isInstallable && (
            <button
              onClick={install}
              type="button"
              aria-label="Instalar app"
              className="touch-target min-w-[44px] min-h-[44px] flex items-center justify-center text-[#1F4BD8] bg-[#E4EBFD] rounded-full active:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4 stroke-[2.25]" />
            </button>
          )}
        </header>

        {/* Saludo moderno y limpio */}
        <div>
          <h1 className="text-[21px] font-bold text-[#0B1B3F] leading-tight">
            Hola, ¿a dónde vas hoy?
          </h1>
        </div>

        {/* Campo interactivo de búsqueda: navega a /buscar */}
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full touch-target min-h-[48px] px-4 py-3 rounded-[22px] bg-[#F2F5FB] border border-[#E3E8F4] flex items-center gap-3 text-left active:bg-[#E4EBFD]/40 transition-colors group shadow-xs"
        >
          <Search className="w-5 h-5 text-[#1F4BD8] shrink-0 stroke-[2.25]" />
          <span className="text-[15px] text-[#5B6B8C] font-normal flex-1">
            ¿A dónde vas?
          </span>
        </button>

        {/* Chips en píldora: "Mis rutas" y "Reportar" */}
        <div className="flex items-center gap-2">
          {/* Chip 1: Mis rutas */}
          <button
            type="button"
            onClick={() => navigate('/mis-rutas')}
            className="touch-target min-h-[44px] px-4 py-2 rounded-full bg-[#E4EBFD] text-[#1F4BD8] text-[13px] font-bold flex items-center gap-1.5 active:bg-blue-200 transition-colors"
          >
            <Star className="w-4 h-4 fill-[#1F4BD8] text-[#1F4BD8]" />
            <span>Mis rutas</span>
          </button>

          {/* Chip 2: Reportar */}
          <button
            type="button"
            onClick={() => navigate('/reporte/tipo')}
            className="touch-target min-h-[44px] px-4 py-2 rounded-full bg-[#E4EBFD] text-[#1F4BD8] text-[13px] font-bold flex items-center gap-1.5 active:bg-blue-200 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-[#1F4BD8] stroke-[2.25]" />
            <span>Reportar</span>
          </button>
        </div>

        {/* Aviso reciente activo (si no ha sido descartado) */}
        {!alertDismissed && (
          <aside
            aria-label="Aviso reciente"
            className="bg-[#FFEDD5] border border-[#FED7AA] rounded-[20px] p-3 text-[#9A3412] relative animate-fadeIn"
          >
            <div className="flex items-start gap-2.5 pr-6">
              <AlertTriangle className="w-4 h-4 text-[#9A3412] shrink-0 mt-0.5" />
              <div className="text-xs leading-snug">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[11px] bg-white text-[#1F4BD8] px-2 py-0.5 rounded-full border border-[#FED7AA]">
                    {INITIAL_ALERT.routeCode}
                  </span>
                  <span className="font-bold text-[11px] text-[#9A3412]">
                    {INITIAL_ALERT.type}
                  </span>
                </div>
                <p className="font-semibold text-[#0B1B3F] text-xs mt-1 leading-snug">
                  {INITIAL_ALERT.description}
                </p>
                <span className="text-[11px] text-[#9A3412]/80 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgoText(INITIAL_ALERT)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              aria-label="Cerrar aviso"
              className="absolute top-2 right-2 p-1 text-[#9A3412] active:text-[#0B1B3F] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        )}
      </div>

      {/* Debajo: MapaReferencia sin ruta ocupando todo el espacio vertical restante, esquinas de 22 px */}
      <div className="flex-1 min-h-0 px-[18px] pb-1 flex flex-col">
        <div className="relative flex-1 w-full rounded-[22px] overflow-hidden border border-[#E3E8F4] shadow-xs">
          <MapaReferencia
            mostrarRuta={false}
            etiqueta="Mapa de referencia"
            className="w-full h-full"
          />

          {/* Acceso oculto discretamente integrado sobre el mapa */}
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-auto">
            <span
              onClick={handleFooterTap}
              className="text-[12px] text-[#5B6B8C]/80 font-medium px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs border border-[#E3E8F4]/60 cursor-default select-none inline-block shadow-2xs"
            >
              Prototipo con datos ilustrativos de prueba
            </span>
          </div>
        </div>
      </div>

      {/* Confirmación oculta de reinicio de datos */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={executeReset}
        title="¿Restablecer datos de prueba?"
        message="Se borrarán los reportes, confirmaciones y rutas guardadas de este dispositivo."
        confirmText="Restablecer"
        cancelText="Cancelar"
        isDestructive={true}
      />

      {/* Barra de navegación inferior flotante */}
      <BottomTabBar />
    </div>
  );
};
