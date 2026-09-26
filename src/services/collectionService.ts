/**
 * Cardback User Collection Service
 * Manages user-owned collection data with hybrid synchronization:
 * - Live Neon PostgreSQL server backend when available (/api/collection)
 * - Transparent offline-resilient local cache in localStorage
 */

import { INITIAL_USER_COLLECTION } from '../data/catalogueSeed';
import { OwnedFigure, CollectionStats, FigureCondition } from '../types/domain';

const STORAGE_KEY = 'cardback_user_collection_v1';

function readUserId(): string | null {
  try {
    const saved = localStorage.getItem('cb_user');
    return saved ? JSON.parse(saved)?.id || null : null;
  } catch {
    return null;
  }
}

let activeUserId = readUserId();
const storageKey = () => `${STORAGE_KEY}:${activeUserId || 'anonymous'}`;

type Listener = (collection: OwnedFigure[]) => void;
const listeners: Set<Listener> = new Set();

function loadFromStorage(): OwnedFigure[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load collection from localStorage', e);
  }
  return activeUserId ? [] : [...INITIAL_USER_COLLECTION];
}

function saveToStorage(collection: OwnedFigure[]): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(collection));
  } catch (e) {
    console.error('Failed to save collection to localStorage', e);
  }
  listeners.forEach(cb => cb(collection));
}

let currentCollection: OwnedFigure[] = loadFromStorage();
let isSyncing = false;
let pendingSync = false;
let dbConnected = false;

// Initial background sync with Neon PostgreSQL
async function syncWithNeon() {
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  isSyncing = true;
  const requestedUserId = activeUserId;
  try {
    const res = await fetch('/api/collection', {
      headers: { Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && requestedUserId === activeUserId) {
        dbConnected = true;
        // Merge Neon items with any local wishlist items
        const wishlists = currentCollection.filter(i => i.isWishlist);
        currentCollection = [...data.items, ...wishlists];
        saveToStorage(currentCollection);
      }
    }
  } catch (e) {
    console.warn('Neon DB not reachable yet, operating in local mode:', e);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      pendingSync = false;
      void syncWithNeon();
    }
  }
}

// Trigger initial sync
if (typeof window !== 'undefined' && activeUserId && localStorage.getItem('cb_token')) {
  syncWithNeon();
}

export const CollectionService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(currentCollection);
    return () => {
      listeners.delete(listener);
    };
  },

  isNeonConnected(): boolean {
    return dbConnected;
  },

  async refetchFromNeon(): Promise<boolean> {
    await syncWithNeon();
    return dbConnected;
  },

  setUserId(userId?: string): void {
    if (activeUserId === (userId || null)) return;
    activeUserId = userId || null;
    dbConnected = false;
    currentCollection = loadFromStorage();
    listeners.forEach(cb => cb(currentCollection));
    if (activeUserId) void syncWithNeon();
  },

  getAll(): OwnedFigure[] {
    return [...currentCollection];
  },

  getOwnedFigures(): OwnedFigure[] {
    return currentCollection.filter(item => !item.isWishlist);
  },

  getWishlist(): OwnedFigure[] {
    return currentCollection.filter(item => Boolean(item.isWishlist));
  },

  getCollectionStats() {
    const stats = this.getStats();
    const unrealizedGain = Math.max(0, stats.totalEstimatedValue - stats.totalInvested);
    const gainPercentage = stats.totalInvested > 0
      ? Math.round((unrealizedGain / stats.totalInvested) * 100)
      : 0;

    return {
      ...stats,
      totalFigures: stats.totalOwned,
      uniqueFiguresCount: stats.totalUniqueFigures,
      unrealizedGain,
      gainPercentage
    };
  },

  getCollection(options?: {
    condition?: FigureCondition | 'ALL';
    franchiseId?: string;
    lineId?: string;
    isWishlist?: boolean;
    search?: string;
    sortBy?: 'date' | 'name' | 'value' | 'price' | 'condition';
    sortOrder?: 'asc' | 'desc';
  }): OwnedFigure[] {
    let list = currentCollection.filter(item => {
      if (options?.isWishlist !== undefined && Boolean(item.isWishlist) !== Boolean(options.isWishlist)) {
        return false;
      }
      if (options?.condition && options.condition !== 'ALL' && item.condition !== options.condition) {
        return false;
      }
      if (options?.franchiseId && item.franchiseId !== options.franchiseId) {
        return false;
      }
      if (options?.lineId && item.lineId !== options.lineId) {
        return false;
      }
      if (options?.search) {
        const q = options.search.toLowerCase();
        const matchName = item.figureName.toLowerCase().includes(q);
        const matchCode = item.figureCode?.toLowerCase().includes(q);
        const matchNotes = item.collectorNotes?.toLowerCase().includes(q);
        const matchVariant = item.variantName?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchNotes && !matchVariant) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    const order = options?.sortOrder === 'desc' ? -1 : 1;
    const sortBy = options?.sortBy || 'date';

    list.sort((a, b) => {
      if (sortBy === 'date') {
        return (new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime()) * order;
      }
      if (sortBy === 'name') {
        return a.figureName.localeCompare(b.figureName) * order;
      }
      if (sortBy === 'value') {
        return (a.estimatedValue - b.estimatedValue) * order;
      }
      if (sortBy === 'price') {
        return (a.purchasePrice - b.purchasePrice) * order;
      }
      if (sortBy === 'condition') {
        return a.condition.localeCompare(b.condition) * order;
      }
      return 0;
    });

    return list;
  },

  getStats(): CollectionStats {
    const ownedOnly = currentCollection.filter(i => !i.isWishlist);
    const totalOwned = ownedOnly.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const uniqueFigures = new Set(ownedOnly.map(i => i.figureId)).size;
    const totalEstimatedValue = ownedOnly.reduce((sum, item) => sum + (item.estimatedValue * (item.quantity || 1)), 0);
    const totalInvested = ownedOnly.reduce((sum, item) => sum + (item.purchasePrice * (item.quantity || 1)), 0);

    const mocCount = ownedOnly.filter(i => i.condition === 'MOC').reduce((sum, item) => sum + (item.quantity || 1), 0);
    const looseCount = ownedOnly.filter(i => i.condition === 'LOOSE_COMPLETE' || i.condition === 'LOOSE_INCOMPLETE').reduce((sum, item) => sum + (item.quantity || 1), 0);
    const gradedCount = ownedOnly.filter(i => i.condition === 'GRADED').reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Franchise breakdown
    const franchiseMap: Record<string, { count: number; value: number }> = {};
    ownedOnly.forEach(item => {
      if (!franchiseMap[item.franchiseName]) {
        franchiseMap[item.franchiseName] = { count: 0, value: 0 };
      }
      franchiseMap[item.franchiseName].count += (item.quantity || 1);
      franchiseMap[item.franchiseName].value += (item.estimatedValue * (item.quantity || 1));
    });

    const franchiseBreakdown = Object.entries(franchiseMap).map(([franchiseName, data]) => ({
      franchiseName,
      count: data.count,
      value: data.value
    }));

    // Line breakdown with total estimates
    const lineMap: Record<string, number> = {};
    ownedOnly.forEach(item => {
      lineMap[item.lineName] = (lineMap[item.lineName] || 0) + (item.quantity || 1);
    });

    const lineBreakdown = Object.entries(lineMap).map(([lineName, count]) => ({
      lineName,
      count,
      totalInLine: 12, // Representative line target
      percentage: Math.min(100, Math.round((count / 12) * 100))
    }));

    return {
      totalOwned,
      totalUniqueFigures: uniqueFigures,
      totalEstimatedValue,
      totalInvested,
      mocCount,
      looseCount,
      gradedCount,
      franchiseBreakdown,
      lineBreakdown
    };
  },

  addFigure(data: Omit<OwnedFigure, 'id' | 'addedAt'>): OwnedFigure {
    const newFigure: OwnedFigure = {
      ...data,
      id: `own-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      addedAt: new Date().toISOString()
    };
    currentCollection = [newFigure, ...currentCollection];
    saveToStorage(currentCollection);

    // Asynchronously push to Neon backend if available
    fetch('/api/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` },
      body: JSON.stringify(newFigure)
    }).catch(err => console.warn('Could not persist to Neon asynchronously:', err));

    return newFigure;
  },

  updateFigure(id: string, updates: Partial<OwnedFigure>): OwnedFigure | null {
    const index = currentCollection.findIndex(item => item.id === id);
    if (index === -1) return null;
    currentCollection[index] = {
      ...currentCollection[index],
      ...updates
    };
    saveToStorage(currentCollection);
    fetch(`/api/collection/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` },
      body: JSON.stringify(updates)
    }).catch(err => console.warn('Could not persist collection update:', err));
    return currentCollection[index];
  },

  removeFigure(id: string): boolean {
    const initialLen = currentCollection.length;
    currentCollection = currentCollection.filter(item => item.id !== id);
    if (currentCollection.length !== initialLen) {
      saveToStorage(currentCollection);

      // Delete from Neon backend asynchronously
      fetch(`/api/collection/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` }
      }).catch(err => console.warn('Could not delete from Neon asynchronously:', err));

      return true;
    }
    return false;
  },

  toggleWishlist(id: string): boolean {
    const item = currentCollection.find(i => i.id === id);
    if (!item) return false;
    item.isWishlist = !item.isWishlist;
    saveToStorage(currentCollection);
    return true;
  },

  checkFigureOwnership(figureId: string): { owned: boolean; inWishlist: boolean; count: number } {
    const matches = currentCollection.filter(i => i.figureId === figureId);
    const owned = matches.some(i => !i.isWishlist);
    const inWishlist = matches.some(i => Boolean(i.isWishlist));
    return {
      owned,
      inWishlist,
      count: matches.length
    };
  },

  resetToDefault(): void {
    currentCollection = [...INITIAL_USER_COLLECTION];
    saveToStorage(currentCollection);
  }
};
