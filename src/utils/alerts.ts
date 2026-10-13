import { AlertReport, INITIAL_ALERT } from '../data/mockData';

const ALERTS_STORAGE_KEY = 'rutea_alerts_v1';
const CONFIRMATIONS_STORAGE_KEY = 'rutea_confirmations_v1';

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

export function getTimeAgoText(alert: AlertReport): string {
  if (alert.id === INITIAL_ALERT.id) {
    return 'hace 25 min';
  }

  const alertTime = new Date(alert.timestamp).getTime();
  if (isNaN(alertTime)) {
    return alert.reportedTimeAgo || 'hace un momento';
  }

  const diffMs = Math.max(0, Date.now() - alertTime);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) {
    return 'hace un momento';
  }
  if (diffMin < 60) {
    return `hace ${diffMin} min`;
  }
  if (diffHour < 24) {
    return `hace ${diffHour} h`;
  }
  return 'hace más de 24 h';
}

export function formatAlertDateTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    // Format: "13 oct, 5:25 p. m."
    return d.toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function getStoredConfirmations(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CONFIRMATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function addConfirmation(alertId: string): void {
  try {
    const confs = getStoredConfirmations();
    confs[alertId] = (confs[alertId] || 0) + 1;
    localStorage.setItem(CONFIRMATIONS_STORAGE_KEY, JSON.stringify(confs));
  } catch (error) {
    console.warn('Error al guardar confirmación en localStorage:', error);
  }
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
  const now = Date.now();
  const confirmationsMap = getStoredConfirmations();

  // 1. Revisar alerta inicial simulada (INITIAL_ALERT siempre se muestra)
  if (matchesRoute(routeCode, INITIAL_ALERT.routeCode)) {
    const extraConf = confirmationsMap[INITIAL_ALERT.id] || 0;
    matchingAlerts.push({
      ...INITIAL_ALERT,
      confirmations: (INITIAL_ALERT.confirmations || 1) + extraConf,
    });
  }

  // 2. Revisar alertas guardadas por el usuario en localStorage
  // Los avisos guardados con más de 24 horas no se muestran
  const stored = getStoredAlerts();
  for (const item of stored) {
    if (matchesRoute(routeCode, item.routeCode)) {
      const itemTime = new Date(item.timestamp).getTime();
      const isMoreThan24Hours = !isNaN(itemTime) && now - itemTime > 24 * 60 * 60 * 1000;
      if (!isMoreThan24Hours) {
        if (!matchingAlerts.some((a) => a.id === item.id)) {
          const extraConf = confirmationsMap[item.id] || 0;
          matchingAlerts.push({
            ...item,
            confirmations: (item.confirmations || 1) + extraConf,
          });
        }
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

export function findRecentAlert(routeCode: string, typeKey: string): AlertReport | undefined {
  const alerts = getAlertsForRoute(routeCode);
  const now = Date.now();

  for (const a of alerts) {
    if (a.typeKey === typeKey) {
      if (a.id === INITIAL_ALERT.id) {
        // INITIAL_ALERT cuenta como de 25 min (< 60 min)
        return a;
      }
      const time = new Date(a.timestamp).getTime();
      if (!isNaN(time) && now - time < 60 * 60 * 1000) {
        return a;
      }
    }
  }

  return undefined;
}
