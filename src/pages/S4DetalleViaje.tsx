import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const S4DetalleViaje: React.FC = () => {
  return (
    <ConstructionScreen
      screenCode="S4"
      title="Detalle del viaje"
      description="Aquí se mostrará el paso a paso del viaje: parada donde abordar, tiempo de recorrido, transbordos y parada final."
      nextLinks={[
        {
          label: 'Ir a Mis rutas guardadas (G2)',
          to: '/mis-rutas',
          variant: 'secondary',
        },
      ]}
      backFallback="/resultados"
    />
  );
};
