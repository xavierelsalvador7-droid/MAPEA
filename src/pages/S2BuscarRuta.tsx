import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import { KNOWN_PLACES, Place } from '../data/mockData';
import {
  MapPin,
  Navigation,
  Search,
  AlertCircle,
  X,
  ArrowUpDown,
  CornerDownRight
} from 'lucide-react';

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findExactPlace(query: string): Place | undefined {
  const norm = normalizeText(query);
  if (!norm) return undefined;

  // 1. Coincidencia directa por nombre
  const byName = KNOWN_PLACES.find((p) => normalizeText(p.name) === norm);
  if (byName) return byName;

  // 2. Coincidencia con municipio o formato extendido
  return KNOWN_PLACES.find(
    (p) =>
      normalizeText(`${p.name}, ${p.municipality}`) === norm ||
      normalizeText(`${p.name} (${p.municipality})`) === norm ||
      normalizeText(`${p.name} - ${p.municipality}`) === norm
  );
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

function getSimilarPlaces(query: string): Place[] {
  const norm = normalizeText(query);
  if (!norm) return [];

  const words = norm.split(/\s+/).filter((w) => w.length >= 3);
  const firstThree = norm.length >= 3 ? norm.slice(0, 3) : '';

  return KNOWN_PLACES.filter((p) => {
    const nameNorm = normalizeText(p.name);
    const muniNorm = normalizeText(p.municipality);
    const combined = `${nameNorm} ${muniNorm}`;
    const placeWords = combined.split(/\s+/);

    // Comparte las primeras 3 letras
    if (
      firstThree &&
      (nameNorm.startsWith(firstThree) ||
        muniNorm.startsWith(firstThree) ||
        combined.includes(firstThree))
    ) {
      return true;
    }

    // Comparte alguna palabra de 3 o más letras
    if (words.some((w) => placeWords.some((pw) => pw.includes(w) || w.includes(pw)))) {
      return true;
    }

    return false;
  }).slice(0, 3);
}

export const S2BuscarRuta: React.FC = () => {
  const navigate = useNavigate();

  // Estados persistentes desde sessionStorage para conservar lo escrito al regresar
  const [origin, setOrigin] = useState<string>(() => {
    return sessionStorage.getItem('rutea_s2_origin') || '';
  });
  const [destination, setDestination] = useState<string>(() => {
    return sessionStorage.getItem('rutea_s2_dest') || '';
  });

  // Control de dropdown: solo una lista abierta a la vez
  const [activeDropdown, setActiveDropdown] = useState<'origin' | 'destination' | null>(null);

  // Errores específicos por campo
  const [originError, setOriginError] = useState<string | null>(null);
  const [originSimilar, setOriginSimilar] = useState<Place[]>([]);

  const [destError, setDestError] = useState<string | null>(null);
  const [destSimilar, setDestSimilar] = useState<Place[]>([]);

  const [samePlaceError, setSamePlaceError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Guardar en sessionStorage para conservar valores al volver atrás
  useEffect(() => {
    sessionStorage.setItem('rutea_s2_origin', origin);
  }, [origin]);

  useEffect(() => {
    sessionStorage.setItem('rutea_s2_dest', destination);
  }, [destination]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejo de cambios en Origen
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setActiveDropdown('origin');
    // El mensaje desaparece cuando la persona vuelve a escribir en ese campo
    setOriginError(null);
    setOriginSimilar([]);
    if (samePlaceError) setSamePlaceError(false);
  };

  // Manejo de cambios en Destino
  const handleDestChange = (val: string) => {
    setDestination(val);
    setActiveDropdown('destination');
    // El mensaje desaparece cuando la persona vuelve a escribir en ese campo
    setDestError(null);
    setDestSimilar([]);
    if (samePlaceError) setSamePlaceError(false);
  };

  // Seleccionar sugerencia para Origen
  const handleSelectOrigin = (place: Place) => {
    setOrigin(place.name);
    setActiveDropdown(null);
    setOriginError(null);
    setOriginSimilar([]);
    if (samePlaceError) setSamePlaceError(false);
  };

  // Seleccionar sugerencia para Destino
  const handleSelectDestination = (place: Place) => {
    setDestination(place.name);
    setActiveDropdown(null);
    setDestError(null);
    setDestSimilar([]);
    if (samePlaceError) setSamePlaceError(false);
  };

  // Intercambiar origen y destino
  const handleSwap = () => {
    const tempO = origin;
    const tempD = destination;
    setOrigin(tempD);
    setDestination(tempO);
    setActiveDropdown(null);
    setOriginError(null);
    setDestError(null);
    setOriginSimilar([]);
    setDestSimilar([]);
    setSamePlaceError(false);
  };

  // Validación y Búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);

    let hasError = false;

    // 1. Campo vacío al buscar
    const isOriginEmpty = !origin.trim();
    const isDestEmpty = !destination.trim();

    if (isOriginEmpty) {
      setOriginError('Escribe el origen');
      setOriginSimilar([]);
      hasError = true;
    }

    if (isDestEmpty) {
      setDestError('Escribe el destino');
      setDestSimilar([]);
      hasError = true;
    }

    if (hasError) return;

    // 2. Comprobar lugares reconocidos
    const originPlace = findExactPlace(origin);
    const destPlace = findExactPlace(destination);

    if (!originPlace) {
      setOriginError('No encontramos ese lugar. Prueba con un punto de referencia o el municipio');
      setOriginSimilar(getSimilarPlaces(origin));
      hasError = true;
    }

    if (!destPlace) {
      setDestError('No encontramos ese lugar. Prueba con un punto de referencia o el municipio');
      setDestSimilar(getSimilarPlaces(destination));
      hasError = true;
    }

    if (hasError) return;

    // 3. Origen igual a destino (5c)
    if (originPlace && destPlace && originPlace.id === destPlace.id) {
      setSamePlaceError(true);
      return;
    }

    // 4. Salida correcta: navegar a /resultados?o=ID_ORIGEN&d=ID_DESTINO
    if (originPlace && destPlace) {
      navigate(`/resultados?o=${originPlace.id}&d=${destPlace.id}`);
    }
  };

  const originSuggestions = activeDropdown === 'origin' ? getAutocompleteSuggestions(origin) : [];
  const destSuggestions = activeDropdown === 'destination' ? getAutocompleteSuggestions(destination) : [];

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar title="Buscar ruta" showBack={true} backFallback="/" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between" ref={containerRef}>
        <form onSubmit={handleSearch} noValidate className="space-y-4">
          
          {/* Card de campos Origen y Destino */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4 relative">
            
            {/* CAMPO ORIGEN */}
            <div className="relative">
              <label
                htmlFor="input-origen"
                className="block text-sm font-bold text-slate-800 mb-1.5"
              >
                Origen
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1f5c8b]">
                  <MapPin className="w-5 h-5" />
                </div>
                
                <input
                  id="input-origen"
                  type="text"
                  autoComplete="off"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => setActiveDropdown('origin')}
                  placeholder="Escribe dónde estás"
                  aria-invalid={!!originError}
                  aria-describedby={originError ? 'origen-error' : undefined}
                  className={`w-full min-h-[48px] pl-11 pr-10 py-3 rounded-xl border text-[16px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                    originError
                      ? 'border-[#b3382c] bg-red-50/20 focus:border-[#b3382c] focus:ring-2 focus:ring-[#b3382c]/20'
                      : 'border-slate-300 focus:border-[#1f5c8b] focus:ring-2 focus:ring-[#1f5c8b]/20'
                  }`}
                />

                {origin && (
                  <button
                    type="button"
                    onClick={() => handleOriginChange('')}
                    aria-label="Borrar origen"
                    className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 active:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sugerencias Autocompletar Origen (hasta 4) */}
              {activeDropdown === 'origin' && originSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100"
                >
                  {originSuggestions.map((place) => (
                    <li
                      key={place.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectOrigin(place)}
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

              {/* Mensaje de error Origen */}
              {originError && (
                <div id="origen-error" className="mt-2 text-sm text-[#b3382c] space-y-2">
                  <div className="flex items-start gap-1.5 font-medium leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{originError}</span>
                  </div>

                  {/* Sugerencias parecidas si lugar no fue reconocido */}
                  {originSimilar.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs text-slate-600 mb-1.5 font-normal">
                        ¿Quisiste decir alguno de estos lugares?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {originSimilar.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectOrigin(place)}
                            className="touch-target min-h-[40px] px-3 py-1.5 rounded-lg bg-blue-50 text-[#1f5c8b] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 active:bg-blue-100 transition-colors"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>{place.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón para intercambiar Origen y Destino */}
            <div className="flex justify-end -my-1 pr-2">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Intercambiar origen y destino"
                className="touch-target flex items-center gap-1.5 text-xs font-semibold text-[#1f5c8b] active:text-[#18496e] px-2 py-1 rounded-md"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Intercambiar</span>
              </button>
            </div>

            {/* CAMPO DESTINO */}
            <div className="relative">
              <label
                htmlFor="input-destino"
                className="block text-sm font-bold text-slate-800 mb-1.5"
              >
                Destino
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2e7d32]">
                  <Navigation className="w-5 h-5" />
                </div>
                
                <input
                  id="input-destino"
                  type="text"
                  autoComplete="off"
                  value={destination}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => setActiveDropdown('destination')}
                  placeholder="Escribe a dónde vas"
                  aria-invalid={!!destError || samePlaceError}
                  aria-describedby={destError ? 'destino-error' : samePlaceError ? 'same-place-error' : undefined}
                  className={`w-full min-h-[48px] pl-11 pr-10 py-3 rounded-xl border text-[16px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                    destError || samePlaceError
                      ? 'border-[#b3382c] bg-red-50/20 focus:border-[#b3382c] focus:ring-2 focus:ring-[#b3382c]/20'
                      : 'border-slate-300 focus:border-[#1f5c8b] focus:ring-2 focus:ring-[#1f5c8b]/20'
                  }`}
                />

                {destination && (
                  <button
                    type="button"
                    onClick={() => handleDestChange('')}
                    aria-label="Borrar destino"
                    className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 active:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sugerencias Autocompletar Destino (hasta 4) */}
              {activeDropdown === 'destination' && destSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100"
                >
                  {destSuggestions.map((place) => (
                    <li
                      key={place.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectDestination(place)}
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

              {/* Mensaje de error Destino */}
              {destError && (
                <div id="destino-error" className="mt-2 text-sm text-[#b3382c] space-y-2">
                  <div className="flex items-start gap-1.5 font-medium leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{destError}</span>
                  </div>

                  {/* Sugerencias parecidas si lugar no fue reconocido */}
                  {destSimilar.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs text-slate-600 mb-1.5 font-normal">
                        ¿Quisiste decir alguno de estos lugares?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {destSimilar.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectDestination(place)}
                            className="touch-target min-h-[40px] px-3 py-1.5 rounded-lg bg-blue-50 text-[#1f5c8b] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 active:bg-blue-100 transition-colors"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>{place.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Validación Origen igual a destino (5c) */}
              {samePlaceError && (
                <div id="same-place-error" className="mt-2 text-sm text-[#b3382c] flex items-start gap-1.5 font-medium leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>El origen y el destino son el mismo lugar</span>
                </div>
              )}
            </div>

          </div>

          {/* Botón principal "Buscar ruta" fijo debajo de los campos */}
          <div>
            <button
              type="submit"
              className="w-full touch-target min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1f5c8b] text-white font-bold text-base shadow-md active:bg-[#18496e] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Buscar ruta</span>
            </button>
          </div>

        </form>

        {/* Guía informativa de lugares de prueba disponibles */}
        <section className="mt-6 p-3.5 bg-white/70 rounded-xl border border-slate-200 text-xs text-slate-600">
          <p className="font-bold text-slate-700 mb-1">
            Lugares de prueba disponibles en el prototipo:
          </p>
          <p className="leading-relaxed text-slate-600">
            Alcaldía de Mejicanos, Plaza Libertad, Salvador del Mundo, Terminal de Occidente, Parque Central de Santa Tecla, Parque Central de Chalatenango, Parque Central de Santiago Nonualco y Chiltiupán.
          </p>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
};
