import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { KNOWN_PLACES, Place, AlertReport, MOCK_JOURNEYS } from '../data/mockData';
import { addAlert, addConfirmation, findRecentAlert } from '../utils/alerts';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  WifiOff,
  Check,
  Send,
  X,
  MapPin
} from 'lucide-react';

const TYPE_NAMES: Record<string, string> = {
  'cambio-recorrido': 'Cambió el recorrido',
  'ruta-no-pasa': 'La ruta no está pasando',
  'cambio-parada': 'Cambió la parada',
  'retraso-desvio': 'Retraso o desvío hoy',
  'dato-incorrecto': 'La app tiene un dato incorrecto',
};

const ROUTE_OPTIONS = ['Ruta 26', 'Ruta 101-D', 'Ruta 125'];

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getAutocompleteSuggestions(query: string): Place[] {
  const norm = normalizeText(query);
  if (norm.length < 2) return [];

  return KNOWN_PLACES.filter((p) => {
    const nameNorm = normalizeText(p.name);
    const muniNorm = normalizeText(p.municipality);
    return nameNorm.includes(norm) || muniNorm.includes(norm);
  }).slice(0, 4);
}

export const R2DetallesReporte: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const t = searchParams.get('t') || '';
  const o = searchParams.get('o') || '';
  const d = searchParams.get('d') || '';
  const r = searchParams.get('r') || '';

  // Redirigir si falta t
  useEffect(() => {
    if (!t) {
      navigate('/reporte/tipo', { replace: true });
    }
  }, [t, navigate]);

  const typeTitle = TYPE_NAMES[t] || 'Detalles del reporte';

  // Preselección de ruta según r buscando en MOCK_JOURNEYS
  const getInitialRoute = (): string => {
    if (!r) return '';
    for (const journey of MOCK_JOURNEYS) {
      const found = journey.options.find((opt) => opt.id === r);
      if (found) {
        return found.code.replace(/\s+con combinación$/i, '').trim();
      }
    }
    return '';
  };

  const [selectedRoute, setSelectedRoute] = useState<string>(getInitialRoute);
  const [reference, setReference] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const [showRefSuggestions, setShowRefSuggestions] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Error 4d: Alerta similar detectada hace <60 min
  const [similarAlert, setSimilarAlert] = useState<AlertReport | null>(null);

  // Error 4b: Estado de conexión
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const refContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (refContainerRef.current && !refContainerRef.current.contains(e.target as Node)) {
        setShowRefSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const charCount = comment.length;
  const isOverLimit = charCount > 140;

  const navigateToConfirmation = () => {
    const params = new URLSearchParams();
    if (t) params.set('t', t);
    if (o) params.set('o', o);
    if (d) params.set('d', d);
    if (r) params.set('r', r);
    navigate(`/reporte/confirmacion?${params.toString()}`);
  };

  const createAndSubmitAlert = () => {
    // Generar descripción combinada
    let desc = typeTitle;
    if (reference.trim()) {
      desc += `. Referencia: ${reference.trim()}`;
    }
    if (comment.trim()) {
      desc += `. ${comment.trim()}`;
    }

    const newAlert: AlertReport = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      routeCode: selectedRoute,
      type: typeTitle,
      typeKey: t,
      description: desc,
      reference: reference.trim() || undefined,
      comment: comment.trim() || undefined,
      source: 'Reportado por usuarios',
      reportedTimeAgo: 'hace un momento',
      timestamp: new Date().toISOString(),
      confirmations: 1,
    };

    addAlert(newAlert);
    navigateToConfirmation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Error 4a: Ruta obligatoria
    if (!selectedRoute) {
      setRouteError('Elige la ruta para poder enviar');
      return;
    }

    // Si excede 140 caracteres, está deshabilitado
    if (isOverLimit) {
      return;
    }

    // Error 4d: Verificar si ya existe reporte parecido hace < 60 min
    const recent = findRecentAlert(selectedRoute, t);
    if (recent) {
      setSimilarAlert(recent);
      return;
    }

    createAndSubmitAlert();
  };

  // Botón 1 de Error 4d: "A mí también me pasó"
  const handleConfirmExisting = () => {
    if (similarAlert) {
      addConfirmation(similarAlert.id);
    }
    navigateToConfirmation();
  };

  // Botón 2 de Error 4d: "Enviar el mío igual"
  const handleForceSubmit = () => {
    createAndSubmitAlert();
  };

  const refSuggestions = showRefSuggestions ? getAutocompleteSuggestions(reference) : [];

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar
        title={typeTitle}
        showBack={true}
        backFallback={t ? `/reporte/tipo?${searchParams.toString()}` : '/reporte/tipo'}
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Error 4b: Banner si no hay conexión */}
          {!isOnline && (
            <div className="bg-[#FFEDD5] border border-[#FED7AA] rounded-[22px] p-4 text-[#9A3412] flex items-start gap-2.5">
              <WifiOff className="w-5 h-5 text-[#9A3412] shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-snug">
                No hay conexión. Tu reporte se guarda y se envía cuando vuelvas a tener datos.
              </p>
            </div>
          )}

          <div className="bg-[#F2F5FB] rounded-[22px] p-4 border border-[#E3E8F4] space-y-4">
            
            {/* CAMPO RUTA (Select nativo, 16px, 48px alto) */}
            <div>
              <label htmlFor="select-route" className="block text-sm font-bold text-[#0B1B3F] mb-1.5">
                Ruta <span className="text-[#B42318]">*</span>
              </label>

              <select
                id="select-route"
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  setRouteError(null);
                  setSimilarAlert(null);
                }}
                className={`w-full min-h-[48px] px-4 py-3 rounded-[22px] border text-[16px] text-[#0B1B3F] bg-white focus:outline-none transition-colors ${
                  routeError
                    ? 'border-[#B42318] bg-red-50/20 focus:border-[#B42318] focus:ring-2 focus:ring-[#B42318]/20'
                    : 'border-[#E3E8F4] focus:border-[#1F4BD8] focus:ring-2 focus:ring-[#1F4BD8]/20'
                }`}
              >
                <option value="">Elige la ruta</option>
                {ROUTE_OPTIONS.map((rCode) => (
                  <option key={rCode} value={rCode}>
                    {rCode}
                  </option>
                ))}
              </select>

              {/* Error 4a: Mensaje rojo bajo el selector */}
              {routeError && (
                <div className="mt-1.5 text-xs text-[#B42318] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{routeError}</span>
                </div>
              )}
            </div>

            {/* CAMPO ¿DÓNDE? (REFERENCIA) - Opcional con autocompletar */}
            <div className="relative" ref={refContainerRef}>
              <label htmlFor="input-ref" className="block text-sm font-bold text-[#0B1B3F] mb-1.5">
                ¿Dónde? (referencia) <span className="text-xs font-normal text-[#5B6B8C]">(opcional)</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5B6B8C]">
                  <MapPin className="w-5 h-5" />
                </div>

                <input
                  id="input-ref"
                  type="text"
                  autoComplete="off"
                  value={reference}
                  onChange={(e) => {
                    setReference(e.target.value);
                    setShowRefSuggestions(true);
                  }}
                  onFocus={() => setShowRefSuggestions(true)}
                  placeholder="Ej: frente a la Alcaldía"
                  className="w-full min-h-[48px] pl-11 pr-10 py-3 rounded-[22px] border border-[#E3E8F4] text-[16px] text-[#0B1B3F] bg-white placeholder:text-[#5B6B8C] focus:outline-none focus:border-[#1F4BD8] focus:ring-2 focus:ring-[#1F4BD8]/20 transition-colors"
                />

                {reference && (
                  <button
                    type="button"
                    onClick={() => {
                      setReference('');
                      setShowRefSuggestions(false);
                    }}
                    aria-label="Borrar referencia"
                    className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-[#5B6B8C] active:text-[#0B1B3F]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Lista de sugerencias para referencia */}
              {showRefSuggestions && refSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-[22px] shadow-lg border border-[#E3E8F4] overflow-hidden divide-y divide-[#E3E8F4]"
                >
                  {refSuggestions.map((place) => (
                    <li
                      key={place.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        setReference(place.name);
                        setShowRefSuggestions(false);
                      }}
                      className="touch-target min-h-[48px] px-4 py-2.5 flex flex-col justify-center cursor-pointer active:bg-[#E4EBFD]/50 transition-colors"
                    >
                      <span className="font-bold text-sm text-[#0B1B3F] leading-snug">
                        {place.name}
                      </span>
                      <span className="text-xs text-[#5B6B8C] leading-tight">
                        {place.municipality}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CAMPO COMENTARIO (OPCIONAL) - Textarea con contador */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="textarea-comment" className="block text-sm font-bold text-[#0B1B3F]">
                  Comentario <span className="text-xs font-normal text-[#5B6B8C]">(opcional)</span>
                </label>
                <span
                  className={`text-xs font-mono font-medium ${
                    isOverLimit ? 'text-[#B42318] font-bold' : 'text-[#5B6B8C]'
                  }`}
                >
                  {charCount} / 140
                </span>
              </div>

              <textarea
                id="textarea-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agrega algún detalle útil para los demás pasajeros..."
                className={`w-full p-3.5 rounded-[22px] border text-[16px] text-[#0B1B3F] bg-white placeholder:text-[#5B6B8C] focus:outline-none transition-colors resize-none ${
                  isOverLimit
                    ? 'border-[#B42318] bg-red-50/20 focus:border-[#B42318] focus:ring-2 focus:ring-[#B42318]/20'
                    : 'border-[#E3E8F4] focus:border-[#1F4BD8] focus:ring-2 focus:ring-[#1F4BD8]/20'
                }`}
              />

              {/* Error 4c: Límite excedido */}
              {isOverLimit && (
                <div className="mt-1 text-xs text-[#B42318] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Máximo 140 caracteres</span>
                </div>
              )}
            </div>

            {/* Texto informativo fijo requerido */}
            <p className="text-[12px] text-[#5B6B8C] leading-relaxed border-t border-[#E3E8F4] pt-3">
              Se guarda con la fecha y hora de ahora. No se solicitan datos personales ni cuentas.
            </p>
          </div>

          {/* Error 4d: Alerta parecida hace <60 min sobre el botón */}
          {similarAlert && (
            <div className="bg-[#FFEDD5] border border-[#FED7AA] rounded-[22px] p-4 text-[#9A3412] space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#9A3412] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#0B1B3F] leading-snug">
                    Ya recibimos un reporte parecido hace unos minutos. ¿Quieres añadir el tuyo?
                  </p>
                  <p className="text-xs text-[#9A3412] mt-1 leading-snug">
                    Ruta: <span className="font-bold">{similarAlert.routeCode}</span> · {similarAlert.type}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmExisting}
                  className="w-full touch-target min-h-[48px] py-2.5 px-4 rounded-[22px] bg-[#1F4BD8] text-white font-bold text-sm active:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>A mí también me pasó</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceSubmit}
                  className="w-full touch-target min-h-[48px] py-2.5 px-4 rounded-[22px] bg-white border border-[#FED7AA] text-[#9A3412] font-bold text-sm active:bg-amber-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enviar el mío igual</span>
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal "Enviar reporte" */}
          {!similarAlert && (
            <div>
              <button
                type="submit"
                disabled={isOverLimit}
                className={`w-full touch-target min-h-[48px] py-3.5 px-4 rounded-[22px] font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  isOverLimit
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1F4BD8] text-white active:bg-blue-800 active:scale-[0.99]'
                }`}
              >
                <Send className="w-5 h-5 stroke-[2.25]" />
                <span>Enviar reporte</span>
              </button>
            </div>
          )}

        </form>
      </main>

      <BottomTabBar />
    </div>
  );
};
