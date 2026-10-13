import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const R1TipoReporte: React.FC = () => {
  return (
    <ConstructionScreen
      screenCode="R1"
      title="Tipo de reporte"
      description="Aquí seleccionarás la categoría de la incidencia comunitaria (ej. 'Cambió la parada', 'Desvío de ruta', 'Tráfico o atraso')."
      nextLinks={[
        {
          label: 'Avanzar a Detalles del reporte (R2)',
          to: '/reporte/detalles',
          variant: 'primary',
        },
      ]}
      backFallback="/"
    />
  );
};
