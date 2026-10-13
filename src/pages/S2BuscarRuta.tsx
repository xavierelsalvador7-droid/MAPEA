import React from 'react';
import { ConstructionScreen } from '../components/ConstructionScreen';

export const S2BuscarRuta: React.FC = () => {
  return (
    <ConstructionScreen
      screenCode="S2"
      title="Buscar ruta"
      description="Aquí podrás ingresar tu punto de origen y destino para consultar las rutas disponibles en El Salvador."
      nextLinks={[
        {
          label: 'Simular búsqueda y ver Resultados (S3)',
          to: '/resultados',
          variant: 'primary',
        },
      ]}
      backFallback="/"
    />
  );
};
