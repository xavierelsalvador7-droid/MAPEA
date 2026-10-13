import { AlertReport, INITIAL_ALERT } from '../data/mockData';

const ALERTS_STORAGE_KEY = 'rutea_alerts_v1';

function normalizeCode(code: string): string {
  return code
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function matchesRoute(routeCodeA: string, routeCodeB: string): boolean {
  const normA = normalizeCode(routeCodeA);
  const normB = normalizeCode(routeCodeB);
  if (!normA || !normB) return false;
  return normA === normB || normA.includes(normB) || normB.includes(normA);
}

export function getStoredAlerts(): AlertReport[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('No se pudieron leer las alertas de localStorage:', error);
    return [];
  }
}

export function addAlert(alert: AlertReport): boolean {
  try {
    const current = getStoredAlerts();
    const updated = [alert, ...current];
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn('Error al guardar alerta en localStorage:', error);
    return false;
  }
}

export function getAlertsForRoute(routeCode: string): AlertReport[] {
  const matchingAlerts: AlertReport[] = [];

  // 1. Revisar alerta inicial simulada
  if (matchesRoute(routeCode, INITIAL_ALERT.routeCode)) {
    matchingAlerts.push(INITIAL_ALERT);
  }

  // 2. Revisar alertas guardadas por el usuario en localStorage
  const stored = getStoredAlerts();
  for (const item of stored) {
    if (matchesRoute(routeCode, item.routeCode)) {
      // Evitar duplicados por id
      if (!matchingAlerts.some((a) => a.id === item.id)) {
        matchingAlerts.push(item);
      }
    }
  }

  // 3. Ordenar del más reciente al más antiguo por timestamp
  matchingAlerts.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeB - timeA;
  });

  return matchingAlerts;
}
