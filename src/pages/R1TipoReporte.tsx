import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { BottomTabBar } from '../components/BottomTabBar';
import {
  Route,
  ClockAlert,
  MapPinOff,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface ReportTypeItem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const REPORT_TYPES: ReportTypeItem[] = [
  {
    key: 'cambio-recorrido',
    label: 'Cambió el recorrido',
    description: 'La unidad tomó otra calle o cambió su trayecto',
    icon: <Route className="w-5 h-5 text-[#1f5c8b]" />,
  },
  {
    key: 'ruta-no-pasa',
    label: 'La ruta no está pasando',
    description: 'Mucho tiempo de espera sin unidades en circulación',
    icon: <ClockAlert className="w-5 h-5 text-[#b26a00]" />,
  },
  {
    key: 'cambio-parada',
    label: 'Cambió la parada',
    description: 'Ya no se sube ni se baja en el punto habitual',
    icon: <MapPinOff className="w-5 h-5 text-[#1f5c8b]" />,
  },
  {
    key: 'retraso-desvio',
    label: 'Retraso o desvío hoy',
    description: 'Tráfico pesado, obras en la calle o desvío temporal',
    icon: <AlertCircle className="w-5 h-5 text-[#b26a00]" />,
  },
  {
    key: 'dato-incorrecto',
    label: 'La app tiene un dato incorrecto',
    description: 'Nombre de parada, tiempo estimado o punto erróneo',
    icon: <HelpCircle className="w-5 h-5 text-slate-600]" />,
  },
];

export const R1TipoReporte: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const o = searchParams.get('o') || '';
  const d = searchParams.get('d') || '';
  const r = searchParams.get('r') || '';

  const handleSelectType = (typeKey: string) => {
    const params = new URLSearchParams();
    params.set('t', typeKey);
    if (o) params.set('o', o);
    if (d) params.set('d', d);
    if (r) params.set('r', r);
    navigate(`/reporte/detalles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar title="Reportar un problema" showBack={true} backFallback="/" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="space-y-4">
          
          <div className="bg-[#F2F5FB] rounded-[22px] p-4 border border-[#E3E8F4]">
            <h2 className="text-[20px] font-bold text-[#0B1B3F] leading-snug">
              ¿Qué pasó?
            </h2>
            <p className="text-[13px] text-[#5B6B8C] mt-1.5 leading-relaxed">
              Elige una opción para avisar a otras personas sobre el estado del transporte.
            </p>
          </div>

          {/* 5 Botones grandes (uno por fila, 56 px mínimo de alto) */}
          <div className="space-y-3" role="group" aria-label="Tipos de reporte">
            {REPORT_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelectType(item.key)}
                className="w-full touch-target min-h-[56px] py-3.5 px-4 rounded-[22px] bg-[#F2F5FB] border border-[#E3E8F4] text-left flex items-center justify-between gap-3 active:scale-[0.99] active:bg-[#E4EBFD]/50 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[14px] bg-[#E4EBFD] text-[#1F4BD8] flex items-center justify-center shrink-0">
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                      className: 'w-5 h-5 text-[#1F4BD8] stroke-[2.25]',
                    })}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-[#0B1B3F] leading-snug">
                      {item.label}
                    </span>
                    <span className="block text-xs text-[#5B6B8C] leading-tight mt-0.5 truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#5B6B8C] group-active:text-[#1F4BD8] shrink-0" />
              </button>
            ))}
          </div>

        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
