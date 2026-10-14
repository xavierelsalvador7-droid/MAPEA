import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Reiniciar: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.removeItem('rutea_alerts_v1');
      localStorage.removeItem('rutea_confirmations_v1');
      localStorage.removeItem('rutea_saved_routes_v2');
      sessionStorage.removeItem('rutea_s2_origin');
      sessionStorage.removeItem('rutea_s2_dest');
      sessionStorage.setItem('rutea_reset_notice', 'true');
    } catch (error) {
      console.warn('Error al restablecer datos de prueba:', error);
    }
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};
