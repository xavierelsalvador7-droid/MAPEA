import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const R2DetallesReporte: React.FC = () => {
  return (
    <ConstructionScreen
      screenCode="R2"
      title="Detalles del reporte"
      description="Aquí podrás ingresar la ruta afectada, la parada de referencia y comentarios adicionales para alertar a otros usuarios."
      nextLinks={[
        {
          label: 'Enviar reporte y ver Confirmación (R3)',
          to: '/reporte/confirmacion',
          variant: 'primary',
        },
      ]}
      backFallback="/reporte/tipo"
    />
  );
};
