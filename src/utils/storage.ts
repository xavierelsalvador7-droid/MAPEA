import { RouteOption } from '../data/mockData';

export interface SavedRouteItem {
  id: string;
  routeCode: string;
  originName: string;
  destinationName: string;
  durationText: string;
  savedAt: string;
  routeOption?: RouteOption;
}

const STORAGE_KEY = 'rutea_saved_routes_v1';

export function getSavedRoutes(): SavedRouteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('No se pudo acceder a localStorage o los datos son inválidos:', error);
    return [];
  }
}

export function saveRoute(item: SavedRouteItem): boolean {
  try {
    const current = getSavedRoutes();
    const existingIndex = current.findIndex((r) => r.id === item.id);
    let updated: SavedRouteItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn('Error al guardar ruta en localStorage:', error);
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
