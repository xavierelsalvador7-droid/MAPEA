export interface SavedRoute {
  id: string;
  originId: string;
  destinationId: string;
  optionId: string;
  name: string;
  savedAt: string;
}

export const MAX_SAVED_ROUTES = 10;
const STORAGE_KEY = 'rutea_saved_routes_v2';

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getSavedRoutes(): SavedRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Última guardada primero (por savedAt descendente)
    return parsed.sort((a, b) => {
      const timeA = new Date(a.savedAt).getTime() || 0;
      const timeB = new Date(b.savedAt).getTime() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.warn('No se pudieron leer las rutas guardadas de localStorage:', error);
    return [];
  }
}

export function findSavedTrip(
  originId: string,
  destinationId: string,
  optionId: string
): SavedRoute | undefined {
  const routes = getSavedRoutes();
  return routes.find(
    (r) =>
      r.originId === originId &&
      r.destinationId === destinationId &&
      r.optionId === optionId
  );
}

export function isNameTaken(name: string, excludeId?: string): boolean {
  const norm = normalizeName(name);
  if (!norm) return false;
  const routes = getSavedRoutes();
  return routes.some((r) => r.id !== excludeId && normalizeName(r.name) === norm);
}

export function saveRoute(
  item: Omit<SavedRoute, 'id' | 'savedAt'> & { id?: string; savedAt?: string }
): boolean {
  try {
    const current = getSavedRoutes();
    const existingIndex = current.findIndex(
      (r) =>
        r.id === item.id ||
        (r.originId === item.originId &&
          r.destinationId === item.destinationId &&
          r.optionId === item.optionId)
    );

    const now = item.savedAt || new Date().toISOString();
    const id = item.id || `saved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fullItem: SavedRoute = {
      id,
      originId: item.originId,
      destinationId: item.destinationId,
      optionId: item.optionId,
      name: item.name.trim(),
      savedAt: now,
    };

    let updated: SavedRoute[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = fullItem;
    } else {
      if (current.length >= MAX_SAVED_ROUTES) {
        return false;
      }
      updated = [fullItem, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn('Error al guardar ruta en localStorage:', error);
    return false;
  }
}

export function renameRoute(id: string, name: string): boolean {
  try {
    const current = getSavedRoutes();
    const target = current.find((r) => r.id === id);
    if (!target) return false;
    target.name = name.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.warn('Error al renombrar ruta en localStorage:', error);
    return false;
  }
}

export function removeSavedRoute(id: string): boolean {
  try {
    const current = getSavedRoutes();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn('Error al eliminar ruta en localStorage:', error);
    return false;
  }
}
