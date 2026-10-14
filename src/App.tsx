/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhoneFrame } from './components/PhoneFrame';
import { S1Inicio } from './pages/S1Inicio';
import { S2BuscarRuta } from './pages/S2BuscarRuta';
import { S3Resultados } from './pages/S3Resultados';
import { S4DetalleViaje } from './pages/S4DetalleViaje';
import { R1TipoReporte } from './pages/R1TipoReporte';
import { R2DetallesReporte } from './pages/R2DetallesReporte';
import { R3Confirmacion } from './pages/R3Confirmacion';
import { G2MisRutas } from './pages/G2MisRutas';
import { Reiniciar } from './pages/Reiniciar';

export default function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          {/* Pestaña Inicio: Flujo de búsqueda y reportes */}
          <Route path="/" element={<S1Inicio />} />
          <Route path="/buscar" element={<S2BuscarRuta />} />
          <Route path="/resultados" element={<S3Resultados />} />
          <Route path="/detalle" element={<S4DetalleViaje />} />
          
          {/* Flujo de reportes de problemas */}
          <Route path="/reporte/tipo" element={<R1TipoReporte />} />
          <Route path="/reporte/detalles" element={<R2DetallesReporte />} />
          <Route path="/reporte/confirmacion" element={<R3Confirmacion />} />

          {/* Pestaña Mis rutas */}
          <Route path="/mis-rutas" element={<G2MisRutas />} />

          {/* Ruta para moderador: restablecer datos de prueba */}
          <Route path="/reiniciar" element={<Reiniciar />} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}
