import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookmarkCheck,
  AlertTriangle,
  Clock,
  Calendar,
  Share2,
  Download,
  X,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { INITIAL_ALERT, DATA_LAST_UPDATED } from '../data/mockData';
import { getTimeAgoText } from '../utils/alerts';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const S1Inicio: React.FC = () => {
  const navigate = useNavigate();
  const { isInstallable, isIOS, isInstalled, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showBrowserInstallCard, setShowBrowserInstallCard] = useState(false);

  // Al entrar a S1 (Inicio) borra las claves de sessionStorage para búsqueda nueva
  useEffect(() => {
    try {
      sessionStorage.removeItem('rutea_s2_origin');
      sessionStorage.removeItem('rutea_s2_dest');
    } catch {
      // ignore
    }
  }, []);

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowBrowserInstallCard(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      {/* Top Bar with brand and subtle applet title */}
      <TopBar
        title="RUTEA"
        subtitle="Transporte Público SV"
        rightAction={
          !isInstalled && (
            <button
              onClick={handleInstallClick}
              type="button"
              aria-label="Instalar aplicación"
              className="touch-target flex items-center justify-center text-white active:bg-white/20 rounded-full"
            >
              <Download className="w-5 h-5" />
            </button>
          )
        }
      />

      {/* Main scrollable body */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Mensaje pequeño de instalación en el navegador (sustituto del alert) */}
        {showBrowserInstallCard && (
          <aside
            aria-label="Instrucciones para instalar"
            className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5 shadow-sm relative text-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-[#1f5c8b] shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <p className="text-sm font-semibold text-[#1f5c8b] leading-tight">
                  Instalar RUTEA
                </p>
                <p className="text-xs text-slate-700 mt-1 leading-snug">
                  Para instalar RUTEA, abre las opciones de tu navegador y pulsa "Agregar a pantalla de inicio".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBrowserInstallCard(false)}
                aria-label="Cerrar mensaje"
                className="absolute top-2.5 right-2.5 text-slate-400 active:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* Aviso reciente simulado inicial */}
        {!alertDismissed && (
          <aside
            aria-label="Aviso del servicio"
            className="rounded-2xl bg-[#fff4cc] border border-[#e0b400] p-3.5 shadow-sm relative text-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#e0b400]/20 text-[#b26a00] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-[#1f5c8b] bg-white/80 px-2 py-0.5 rounded border border-[#1f5c8b]/30">
                    {INITIAL_ALERT.routeCode}
                  </span>
                  <span className="font-semibold text-xs text-[#b26a00]">
                    {INITIAL_ALERT.type}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1 leading-snug text-slate-900">
                  {INITIAL_ALERT.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgoText(INITIAL_ALERT)}
                  </span>
                  <span>•</span>
                  <span>{INITIAL_ALERT.source}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertDismissed(true)}
                aria-label="Cerrar aviso"
                className="absolute top-2.5 right-2.5 text-slate-500 active:text-slate-900 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* Banner de Bienvenida con tuteo salvadoreño */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1f5c8b] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1f5c8b]" />
            <span>Moviéndote en El Salvador</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            Planifica tu viaje en bus o microbús sin complicarte
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Consulta rutas, paradas y tiempos estimados con información clara.
          </p>
        </section>

        {/* 3 BOTONES PRINCIPALES (Sin etiquetas técnicas S2, G2, R1; con subtítulos requeridos) */}
        <section className="space-y-3" aria-label="Acciones principales">
          {/* Botón 1: "¿A dónde vas?" -> Lleva a S2 Buscar ruta */}
          <button
            type="button"
            onClick={() => navigate('/buscar')}
            className="w-full touch-target min-h-[58px] px-4 py-3.5 rounded-2xl bg-[#1f5c8b] text-white shadow-md active:bg-[#18496e] transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-base font-bold leading-tight">
                  ¿A dónde vas?
                </span>
                <span className="block text-xs text-blue-100 font-normal mt-0.5">
                  Buscar rutas y conexiones
                </span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/80 shrink-0" />
          </button>

          {/* Botón 2: "Mis rutas guardadas" -> Lleva a pestaña Mis rutas */}
          <button
            type="button"
            onClick={() => navigate('/mis-rutas')}
            className="w-full touch-target min-h-[56px] px-4 py-3.5 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm active:bg-slate-50 transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2e7d32] border border-emerald-200 flex items-center justify-center shrink-0">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-base font-bold leading-tight text-slate-800">
                  Mis rutas guardadas
                </span>
                <span className="block text-xs text-slate-500 font-normal mt-0.5">
                  Tus viajes frecuentes
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          {/* Botón 3: "Reportar un problema" -> Lleva a Reporte */}
          <button
            type="button"
            onClick={() => navigate('/reporte/tipo')}
            className="w-full touch-target min-h-[56px] px-4 py-3.5 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm active:bg-slate-50 transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b26a00] border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-base font-bold leading-tight text-slate-800">
                  Reportar un problema
                </span>
                <span className="block text-xs text-slate-500 font-normal mt-0.5">
                  Avisar sobre una parada o un desvío
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>
        </section>

        {/* Mapa estático de ejemplo (Sin la palabra "(Estático)" en el título) */}
        <section className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1f5c8b]" />
              Esquema de red metropolitana
            </span>
            <span className="text-[11px] text-slate-500">Ejemplo ilustrativo</span>
          </div>

          <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {/* SVG Transit diagram */}
            <svg viewBox="0 0 320 140" className="w-full h-full object-cover">
              <rect width="320" height="140" fill="#f8fafc" />
              
              {/* Subtle grid lines */}
              <path d="M 0 35 L 320 35 M 0 70 L 320 70 M 0 105 L 320 105" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 80 0 L 80 140 M 160 0 L 160 140 M 240 0 L 240 140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Transit line 1: Blue Route 26 */}
              <path d="M 20 110 Q 80 70 160 70 T 300 30" fill="none" stroke="#1f5c8b" strokeWidth="5" strokeLinecap="round" />
              
              {/* Transit line 2: Green Route 101-D */}
              <path d="M 40 30 L 120 70 L 220 70 L 280 120" fill="none" stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 2" />

              {/* Transit line 3: Orange Route 125 */}
              <path d="M 20 50 Q 150 20 300 90" fill="none" stroke="#b26a00" strokeWidth="3" strokeLinecap="round" />

              {/* Transit stops */}
              <circle cx="80" cy="70" r="5" fill="#ffffff" stroke="#1f5c8b" strokeWidth="3" />
              <text x="80" y="90" fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">Mejicanos</text>

              <circle cx="160" cy="70" r="6" fill="#ffffff" stroke="#e0b400" strokeWidth="3" />
              <text x="160" y="58" fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">Salvador del Mundo</text>

              <circle cx="240" cy="50" r="5" fill="#ffffff" stroke="#1f5c8b" strokeWidth="3" />
              <text x="240" y="38" fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle">Plaza Libertad</text>
            </svg>

            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] text-slate-700 px-2 py-0.5 rounded shadow-xs border border-slate-200">
              Mapa de prueba
            </div>
          </div>
        </section>

        {/* Metadata de actualización */}
        <section className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Actualización de datos:</span>
          </div>
          <span className="font-semibold text-slate-800">{DATA_LAST_UPDATED}</span>
        </section>

        {/* PIE DE PÁGINA */}
        <footer className="pt-2 pb-6 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Prototipo con datos ilustrativos de prueba
          </p>
        </footer>

      </main>

      {/* Modal Guía iOS si el usuario quiere instalar */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#1f5c8b]">
                Instalar RUTEA en iPhone
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1f5c8b] flex items-center justify-center font-bold">1</span>
                <span>Toca el botón <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#1f5c8b]" /> <strong>Compartir</strong> en la barra inferior de Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1f5c8b] flex items-center justify-center font-bold">2</span>
                <span>Desliza hacia abajo y elige <strong>"Agregar a pantalla de inicio"</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1f5c8b] flex items-center justify-center font-bold">3</span>
                <span>Pulsa <strong>"Agregar"</strong> arriba a la derecha.</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1f5c8b] text-white font-bold text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
};
