import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const S3Resultados: React.FC = () => {
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
    />
  );
};
