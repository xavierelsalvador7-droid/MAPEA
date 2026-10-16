import React from 'react';
import { MapPin } from 'lucide-react';

export interface MapaReferenciaProps {
  height?: number | string;
  mostrarRuta?: boolean;
  etiqueta?: string;
  className?: string;
}

export const MapaReferencia: React.FC<MapaReferenciaProps> = ({
  height,
  mostrarRuta = false,
  etiqueta,
  className = '',
}) => {
  return (
    <div
      style={height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined}
      className={`relative w-full overflow-hidden bg-[#EAEFF7] select-none ${className}`}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        aria-hidden="true"
      >
        {/* Fondo del mapa */}
        <rect width="400" height="300" fill="#EAEFF7" />

        {/* Manzanas verdes (parques y áreas verdes) */}
        <rect x="25" y="25" width="60" height="50" rx="8" fill="#D9E6D3" />
        <rect x="110" y="25" width="75" height="40" rx="8" fill="#D9E6D3" />
        <rect x="290" y="180" width="85" height="60" rx="8" fill="#D9E6D3" />
        <rect x="20" y="245" width="75" height="40" rx="8" fill="#D9E6D3" />

        {/* Manzanas azul muy suave (zonas cívicas o equipamiento) */}
        <rect x="210" y="25" width="65" height="50" rx="8" fill="#D6E4F5" />
        <rect x="300" y="25" width="75" height="45" rx="8" fill="#D6E4F5" />
        <rect x="25" y="100" width="60" height="65" rx="8" fill="#D6E4F5" />
        <rect x="110" y="185" width="85" height="45" rx="8" fill="#D6E4F5" />
        <rect x="215" y="185" width="55" height="55" rx="8" fill="#D6E4F5" />

        {/* Manzanas residenciales / base neutral muy suave */}
        <rect x="110" y="85" width="75" height="55" rx="8" fill="#E2E8F0" opacity="0.6" />
        <rect x="205" y="95" width="65" height="45" rx="8" fill="#E2E8F0" opacity="0.5" />
        <rect x="290" y="90" width="85" height="65" rx="8" fill="#E2E8F0" opacity="0.6" />
        <rect x="110" y="250" width="160" height="35" rx="8" fill="#E2E8F0" opacity="0.5" />

        {/* Calles secundarias (blancas, 6px) */}
        <path d="M 0 50 L 400 50" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 0 110 L 400 110" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 0 210 L 400 210" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 55 0 L 55 300" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 150 0 L 150 300" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 245 0 L 245 300" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M 340 0 L 340 300" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

        {/* Avenidas principales (blancas, 12px) */}
        <path d="M 0 160 L 400 160" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <path d="M 80 0 L 80 300" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <path d="M 280 0 L 280 300" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />

        {/* Diagonal conectora típica de ciudad */}
        <path d="M 0 280 L 180 160 L 360 80" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Si mostrarRuta es true: dibujar trazo azul, origen y destino */}
        {mostrarRuta && (
          <g>
            {/* Sombra de la ruta para profundidad */}
            <path
              d="M 80 235 L 80 160 L 240 160 L 240 95 L 320 95"
              fill="none"
              stroke="#1F4BD8"
              strokeOpacity="0.2"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Línea de ruta #1F4BD8 de 6 px con extremos redondeados */}
            <path
              d="M 80 235 L 80 160 L 240 160 L 240 95 L 320 95"
              fill="none"
              stroke="#1F4BD8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Punto de origen: círculo blanco con borde azul */}
            <circle cx="80" cy="235" r="9" fill="#1F4BD8" />
            <circle cx="80" cy="235" r="7" fill="#FFFFFF" stroke="#1F4BD8" strokeWidth="3" />

            {/* Pin de destino: círculo azul con punto blanco (mínimo 70px del borde superior: cy=95) */}
            <circle cx="320" cy="95" r="10" fill="#1F4BD8" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="320" cy="95" r="4" fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Etiqueta como píldora blanca pequeña en la esquina superior izquierda */}
      {etiqueta && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#5B6B8C] shadow-xs border border-[#E3E8F4] flex items-center gap-1.5 z-10 pointer-events-none">
          <MapPin className="w-3 h-3 text-[#1F4BD8]" />
          <span>{etiqueta}</span>
        </div>
      )}
    </div>
  );
};
