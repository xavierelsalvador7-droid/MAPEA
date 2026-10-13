import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConstructionScreen } from '../components/ConstructionScreen';
import { KNOWN_PLACES } from '../data/mockData';
import { MapPin, Navigation } from 'lucide-react';

export const S3Resultados: React.FC = () => {
  const [searchParams] = useSearchParams();
  const originId = searchParams.get('o') || '';
  const destId = searchParams.get('d') || '';

  const originPlace = KNOWN_PLACES.find((p) => p.id === originId);
  const destPlace = KNOWN_PLACES.find((p) => p.id === destId);

  return (
    <ConstructionScreen
      screenCode="S3"
      title="Resultados"
      description="Aquí se mostrarán las opciones de transporte encontradas (rutas directas o combinaciones) con sus tiempos estimados."
      nextLinks={[
        {
          label: 'Elegir ruta y ver Detalle del viaje (S4)',
          to: '/detalle',
          variant: 'primary',
        },
      ]}
      backFallback="/buscar"
    >
      {/* Tarjeta de verificación de origen y destino recibidos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-left max-w-sm mx-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Parámetros de búsqueda recibidos:
        </p>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#1f5c8b] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Origen:</span>
              <span className="font-bold text-slate-900 block">
                {originPlace ? originPlace.name : originId || '(No especificado)'}
              </span>
              {originPlace && (
                <span className="text-xs text-slate-500 block">
                  {originPlace.municipality} (ID: {originPlace.id})
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1" />

          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#2e7d32] shrink-0 mt-0.5">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Destino:</span>
              <span className="font-bold text-slate-900 block">
                {destPlace ? destPlace.name : destId || '(No especificado)'}
              </span>
              {destPlace && (
                <span className="text-xs text-slate-500 block">
                  {destPlace.municipality} (ID: {destPlace.id})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConstructionScreen>
  );
};
