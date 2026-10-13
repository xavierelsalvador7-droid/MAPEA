import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const R3Confirmacion: React.FC = () => {
  return (
    <ConstructionScreen
      screenCode="R3"
      title="Confirmación de reporte"
      description="¡Gracias por tu aporte! Tu reporte se procesará para alertar a la comunidad sobre el estado del transporte."
      nextLinks={[
        {
          label: 'Volver a la pantalla de Inicio (S1)',
          to: '/',
          variant: 'primary',
        },
      ]}
      backFallback="/reporte/detalles"
    />
  );
};
