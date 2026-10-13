import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { KNOWN_PLACES, Place, AlertReport } from '../data/mockData';
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

  // Preselección de ruta según r
  const getInitialRoute = (): string => {
    if (!r) return '';
    const lowerR = r.toLowerCase();
    if (lowerR.includes('26')) return 'Ruta 26';
    if (lowerR.includes('101')) return 'Ruta 101-D';
    if (lowerR.includes('125')) return 'Ruta 125';
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
    if (reference.trim() && comment.trim()) {
      desc = `${typeTitle} frente a ${reference.trim()}: ${comment.trim()}`;
    } else if (reference.trim()) {
      desc = `${typeTitle} frente a ${reference.trim()}`;
    } else if (comment.trim()) {
      desc = `${typeTitle}: ${comment.trim()}`;
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
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar
        title={typeTitle}
        showBack={true}
        backFallback={t ? `/reporte/tipo?${searchParams.toString()}` : '/reporte/tipo'}
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Error 4b: Banner si no hay conexión */}
          {!isOnline && (
            <div className="bg-[#fff4cc] border border-[#e0b400] rounded-2xl p-3.5 shadow-sm text-slate-800 flex items-start gap-2.5">
              <WifiOff className="w-5 h-5 text-[#b26a00] shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-snug text-slate-900">
                No hay conexión. Tu reporte se guarda y se envía cuando vuelvas a tener datos.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
            
            {/* CAMPO RUTA (Select nativo, 16px, 48px alto) */}
            <div>
              <label htmlFor="select-route" className="block text-sm font-bold text-slate-800 mb-1.5">
                Ruta <span className="text-[#b3382c]">*</span>
              </label>

              <select
                id="select-route"
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  setRouteError(null);
                  setSimilarAlert(null);
                }}
                className={`w-full min-h-[48px] px-3.5 py-3 rounded-xl border text-[16px] text-slate-900 bg-white focus:outline-none transition-colors ${
                  routeError
                    ? 'border-[#b3382c] bg-red-50/20 focus:border-[#b3382c] focus:ring-2 focus:ring-[#b3382c]/20'
                    : 'border-slate-300 focus:border-[#1f5c8b] focus:ring-2 focus:ring-[#1f5c8b]/20'
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
                <div className="mt-1.5 text-xs text-[#b3382c] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{routeError}</span>
                </div>
              )}
            </div>

            {/* CAMPO ¿DÓNDE? (REFERENCIA) - Opcional con autocompletar */}
            <div className="relative" ref={refContainerRef}>
              <label htmlFor="input-ref" className="block text-sm font-bold text-slate-800 mb-1.5">
                ¿Dónde? (referencia) <span className="text-xs font-normal text-slate-500">(opcional)</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  className="w-full min-h-[48px] pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-[16px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1f5c8b] focus:ring-2 focus:ring-[#1f5c8b]/20 transition-colors"
                />

                {reference && (
                  <button
                    type="button"
                    onClick={() => {
                      setReference('');
                      setShowRefSuggestions(false);
                    }}
                    aria-label="Borrar referencia"
                    className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 active:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Lista de sugerencias para referencia */}
              {showRefSuggestions && refSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100"
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
                      className="touch-target min-h-[48px] px-3.5 py-2.5 flex flex-col justify-center cursor-pointer active:bg-blue-50 transition-colors"
                    >
                      <span className="font-bold text-sm text-slate-900 leading-snug">
                        {place.name}
                      </span>
                      <span className="text-xs text-slate-500 leading-tight">
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
                <label htmlFor="textarea-comment" className="block text-sm font-bold text-slate-800">
                  Comentario <span className="text-xs font-normal text-slate-500">(opcional)</span>
                </label>
                <span
                  className={`text-xs font-mono font-medium ${
                    isOverLimit ? 'text-[#b3382c] font-bold' : 'text-slate-500'
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
                className={`w-full p-3 rounded-xl border text-[16px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none transition-colors resize-none ${
                  isOverLimit
                    ? 'border-[#b3382c] bg-red-50/20 focus:border-[#b3382c] focus:ring-2 focus:ring-[#b3382c]/20'
                    : 'border-slate-300 focus:border-[#1f5c8b] focus:ring-2 focus:ring-[#1f5c8b]/20'
                }`}
              />

              {/* Error 4c: Límite excedido */}
              {isOverLimit && (
                <div className="mt-1 text-xs text-[#b3382c] flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Máximo 140 caracteres</span>
                </div>
              )}
            </div>

            {/* Texto informativo fijo requerido */}
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              Se guarda con la fecha y hora de ahora. No se solicitan datos personales ni cuentas.
            </p>
          </div>

          {/* Error 4d: Alerta parecida hace <60 min sobre el botón */}
          {similarAlert && (
            <div className="bg-[#fff4cc] border-2 border-[#e0b400] rounded-2xl p-4 shadow-sm text-slate-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#b26a00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    Ya recibimos un reporte parecido hace unos minutos. ¿Quieres añadir el tuyo?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    Ruta: <span className="font-bold text-slate-800">{similarAlert.routeCode}</span> · {similarAlert.type}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmExisting}
                  className="w-full touch-target min-h-[48px] py-2.5 px-4 rounded-xl bg-[#2e7d32] text-white font-bold text-sm shadow-sm active:bg-[#256628] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>A mí también me pasó</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceSubmit}
                  className="w-full touch-target min-h-[48px] py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm active:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enviar el mío igual</span>
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal "Enviar reporte" (48 px mínimo) */}
          {!similarAlert && (
            <div>
              <button
                type="submit"
                disabled={isOverLimit}
                className={`w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 ${
                  isOverLimit
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1f5c8b] text-white active:bg-[#18496e] active:scale-[0.99]'
                }`}
              >
                <Send className="w-5 h-5" />
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
