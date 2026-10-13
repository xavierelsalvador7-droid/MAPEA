export interface Place {
  id: string;
  name: string;
  municipality: string;
}

export interface RouteOption {
  id: string;
  code: string; // e.g. "Ruta 26", "Ruta 101-D", "Ruta 125"
  type: 'directa' | 'combinacion';
  durationText: string;
  durationMinutes: number;
  fareEstimate?: string;
  summary: string;
  steps?: {
    order: number;
    instruction: string;
    stopName?: string;
    details?: string;
  }[];
}

export interface JourneyResult {
  originId: string;
  destinationId: string;
  options: RouteOption[];
}

export interface AlertReport {
  id: string;
  routeCode: string;
  type: string; // "Cambió la parada", etc.
  description: string;
  source: string;
  reportedTimeAgo: string;
  timestamp: string;
}

export const DATA_LAST_UPDATED = '10 de octubre de 2026';

export const KNOWN_PLACES: Place[] = [
  { id: 'alcaldia-mejicanos', name: 'Alcaldía de Mejicanos', municipality: 'Mejicanos' },
  { id: 'plaza-libertad', name: 'Plaza Libertad', municipality: 'San Salvador' },
  { id: 'salvador-del-mundo', name: 'Salvador del Mundo', municipality: 'San Salvador' },
  { id: 'terminal-occidente', name: 'Terminal de Occidente', municipality: 'San Salvador' },
  { id: 'parque-santa-tecla', name: 'Parque Central de Santa Tecla', municipality: 'Santa Tecla' },
  { id: 'parque-chalatenango', name: 'Parque Central de Chalatenango', municipality: 'Chalatenango' },
  { id: 'parque-santiago-nonualco', name: 'Parque Central de Santiago Nonualco', municipality: 'Santiago Nonualco' },
  { id: 'chiltiupan', name: 'Chiltiupán', municipality: 'Chiltiupán' },
];

export const MOCK_JOURNEYS: JourneyResult[] = [
  {
    originId: 'alcaldia-mejicanos',
    destinationId: 'plaza-libertad',
    options: [
      {
        id: 'opt-26-directa',
        code: 'Ruta 26',
        type: 'directa',
        durationText: 'Aprox. 55 min',
        durationMinutes: 55,
        summary: 'Opción A: Ruta 26, directa, aprox. 55 min.',
        steps: [
          {
            order: 1,
            instruction: 'Sube frente a la Alcaldía de Mejicanos',
            stopName: 'Alcaldía',
            details: 'Parada frente al parque municipal de Mejicanos',
          },
          {
            order: 2,
            instruction: 'Viaja aprox. 40 min',
            details: 'Recorrido por Calle Zacamil y Centro Histórico',
          },
          {
            order: 3,
            instruction: 'Bájate frente a Plaza Libertad',
            stopName: 'Plaza Libertad',
            details: 'Parada designada Centro Histórico de San Salvador',
          },
        ],
      },
      {
        id: 'opt-101d-combo',
        code: 'Ruta 101-D con combinación',
        type: 'combinacion',
        durationText: 'Aprox. 1 h 10 min',
        durationMinutes: 70,
        summary: 'Opción B: Ruta 101-D con combinación, aprox. 1 h 10 min.',
        steps: [
          {
            order: 1,
            instruction: 'Toma unidad de enlace hacia punto de conexión',
            stopName: 'Enlace Zacamil',
          },
          {
            order: 2,
            instruction: 'Transborda a la Ruta 101-D',
            stopName: 'Parada de combinación',
          },
          {
            order: 3,
            instruction: 'Bájate en Plaza Libertad',
            stopName: 'Plaza Libertad',
          },
        ],
      },
    ],
  },
  {
    originId: 'parque-santa-tecla',
    destinationId: 'plaza-libertad',
    options: [
      {
        id: 'opt-101d-directa',
        code: 'Ruta 101-D',
        type: 'directa',
        durationText: 'Aprox. 45 min',
        durationMinutes: 45,
        summary: 'Opción A: Ruta 101-D, directa, aprox. 45 min.',
        steps: [
          {
            order: 1,
            instruction: 'Sube en Parque Central de Santa Tecla',
            stopName: 'Parque San Martín / Central',
          },
          {
            order: 2,
            instruction: 'Viaja aprox. 35 min por Alameda Manuel Enrique Araujo y Alameda Roosevelt',
          },
          {
            order: 3,
            instruction: 'Bájate frente a Plaza Libertad',
            stopName: 'Plaza Libertad',
          },
        ],
      },
    ],
  },
  {
    originId: 'terminal-occidente',
    destinationId: 'parque-chalatenango',
    options: [
      {
        id: 'opt-125-directa',
        code: 'Ruta 125',
        type: 'directa',
        durationText: 'Aprox. 1 h 40 min',
        durationMinutes: 100,
        summary: 'Opción A: Ruta 125, directa, aprox. 1 h 40 min.',
        steps: [
          {
            order: 1,
            instruction: 'Aborda la unidad en la Terminal de Occidente',
            stopName: 'Terminal de Occidente',
          },
          {
            order: 2,
            instruction: 'Viaja aprox. 1 h 30 min por Carretera Troncal del Norte hacia Chalatenango',
          },
          {
            order: 3,
            instruction: 'Llega al Parque Central de Chalatenango',
            stopName: 'Parque Central de Chalatenango',
          },
        ],
      },
    ],
  },
];

export const INITIAL_ALERT: AlertReport = {
  id: 'alert-001',
  routeCode: 'Ruta 26',
  type: 'Cambió la parada',
  description: 'Cambió la parada frente a la Alcaldía de Mejicanos',
  source: 'Reportado por usuarios',
  reportedTimeAgo: 'hace 25 minutos',
  timestamp: '2026-10-10T11:45:00Z',
};
