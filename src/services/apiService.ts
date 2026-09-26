/**
 * Cardback Public API Client Service
 * Implements public DTO contract, server-side search, pagination, and detail lookups.
 * Connected to live Neon PostgreSQL backend with offline seed hydration.
 */

import {
  FRANCHISES as SEED_FRANCHISES,
  LINES as SEED_LINES,
  CHARACTERS as SEED_CHARACTERS,
  FIGURES as SEED_FIGURES,
  VARIANTS as SEED_VARIANTS,
  PRODUCT_RELEASES as SEED_PRODUCT_RELEASES,
  MANUFACTURERS as SEED_MANUFACTURERS
} from '../data/catalogueSeed';

import {
  FranchiseDetailResponseDto,
  LineDetailResponseDto,
  CharacterDetailResponseDto,
  FigureDetailResponseDto,
  VariantDetailResponseDto,
  ProductReleaseDetailResponseDto,
  ManufacturerDetailResponseDto,
  GlobalSearchResponseDto,
  GlobalSearchResultItem,
  EntityType,
  FigureSummaryDto
} from '../types/domain';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` });

// Dynamic stores hydrated from seed and live server/PostgreSQL
let figuresStore: FigureDetailResponseDto[] = [...SEED_FIGURES];
let linesStore: LineDetailResponseDto[] = [...SEED_LINES];
let charactersStore: CharacterDetailResponseDto[] = [...SEED_CHARACTERS];
let franchisesStore: FranchiseDetailResponseDto[] = [...SEED_FRANCHISES];
let manufacturersStore: ManufacturerDetailResponseDto[] = [...SEED_MANUFACTURERS];
let variantsStore: VariantDetailResponseDto[] = [...SEED_VARIANTS];
let productReleasesStore: ProductReleaseDetailResponseDto[] = [...SEED_PRODUCT_RELEASES];

// Fast in-memory cache for all retrieved entities
const entityCache = new Map<string, any>();

// Seed cache initially
SEED_FIGURES.forEach(f => entityCache.set(`figure:${f.id}`, f));
SEED_LINES.forEach(l => entityCache.set(`line:${l.id}`, l));
SEED_CHARACTERS.forEach(c => entityCache.set(`character:${c.id}`, c));
SEED_FRANCHISES.forEach(fr => {
  entityCache.set(`franchise:${fr.id}`, fr);
  if (fr.slug) entityCache.set(`franchise:${fr.slug}`, fr);
});
SEED_MANUFACTURERS.forEach(m => entityCache.set(`manufacturer:${m.id}`, m));
SEED_VARIANTS.forEach(v => entityCache.set(`variant:${v.id}`, v));
SEED_PRODUCT_RELEASES.forEach(pr => entityCache.set(`product_release:${pr.id}`, pr));

let isSyncing = false;

/**
 * Background synchronization with live Neon PostgreSQL catalogue
 */
export async function syncCatalogueWithServer(): Promise<boolean> {
  if (isSyncing) return true;
  isSyncing = true;
  try {
    const res = await fetch('/api/catalog/all');
    if (res.ok) {
      const data = await res.json();
      
      if (Array.isArray(data.figures)) {
        const figMap = new Map(figuresStore.map(f => [f.id, f]));
        data.figures.forEach((f: FigureDetailResponseDto) => {
          figMap.set(f.id, f);
          entityCache.set(`figure:${f.id}`, f);
          // Also cache variants and product releases from the figure
          if (Array.isArray(f.variants)) {
            f.variants.forEach(v => entityCache.set(`variant:${v.id}`, v));
          }
          if (Array.isArray(f.productReleases)) {
            f.productReleases.forEach(pr => entityCache.set(`product_release:${pr.id}`, pr));
          }
        });
        figuresStore = Array.from(figMap.values());
      }

      if (Array.isArray(data.lines)) {
        const lineMap = new Map(linesStore.map(l => [l.id, l]));
        data.lines.forEach((l: LineDetailResponseDto) => {
          lineMap.set(l.id, l);
          entityCache.set(`line:${l.id}`, l);
        });
        linesStore = Array.from(lineMap.values());
      }

      if (Array.isArray(data.characters)) {
        const charMap = new Map(charactersStore.map(c => [c.id, c]));
        data.characters.forEach((c: CharacterDetailResponseDto) => {
          charMap.set(c.id, c);
          entityCache.set(`character:${c.id}`, c);
        });
        charactersStore = Array.from(charMap.values());
      }

      if (Array.isArray(data.franchises)) {
        const frMap = new Map(franchisesStore.map(fr => [fr.id, fr]));
        data.franchises.forEach((fr: FranchiseDetailResponseDto) => {
          frMap.set(fr.id, fr);
          entityCache.set(`franchise:${fr.id}`, fr);
          if (fr.slug) entityCache.set(`franchise:${fr.slug}`, fr);
        });
        franchisesStore = Array.from(frMap.values());
      }

      if (Array.isArray(data.manufacturers)) {
        const mfrMap = new Map(manufacturersStore.map(m => [m.id, m]));
        data.manufacturers.forEach((m: ManufacturerDetailResponseDto) => {
          mfrMap.set(m.id, m);
          entityCache.set(`manufacturer:${m.id}`, m);
        });
        manufacturersStore = Array.from(mfrMap.values());
      }

      return true;
    }
  } catch (err) {
    console.warn('Catalogue background sync skipped:', err);
  } finally {
    isSyncing = false;
  }
  return false;
}

// Automatically trigger sync when running in browser
if (typeof window !== 'undefined') {
  syncCatalogueWithServer();
}

export interface AiFigureOption {
  id: string;
  title: string;
  figureName: string;
  lineName: string;
  franchiseName: string;
  manufacturer: string;
  year: number;
  variantName: string;
  packagingStatus: string;
  description: string;
  confidence: number;
  estimatedLooseValue: number;
  estimatedMocValue: number;
  identifyingFeatures: string[];
  accessoriesIdentified: string[];
  moldingDetails: string;
  authenticityNotes: string;
  barcode?: string | null;
  imageUrl?: string;
  source?: 'database' | 'curated_catalog' | 'online_archive';
}

export interface IdentifyFigureApiResponse {
  success: boolean;
  found: boolean;
  isToyOrActionFigure: boolean;
  detectedSubject?: string;
  notFoundReason?: string;
  message?: string;
  figureName?: string;
  franchiseName?: string;
  lineName?: string;
  manufacturer?: string;
  year?: number;
  variantName?: string;
  confidence?: number;
  packagingStatus?: string;
  identifyingFeatures?: string[];
  accessoriesIdentified?: string[];
  moldingDetails?: string;
  authenticityNotes?: string;
  estimatedLooseValue?: number;
  estimatedMocValue?: number;
  barcode?: string | null;
  options?: AiFigureOption[];
  error?: string;
}

export const ApiService = {
  syncCatalogueWithServer,

  // Franchises
  getFranchises(): FranchiseDetailResponseDto[] {
    return [...franchisesStore];
  },

  getFranchiseDetail(id: string): FranchiseDetailResponseDto | null {
    const key = `franchise:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return franchisesStore.find(f => f.id === id || f.slug === id) || null;
  },

  // Lines
  getLines(options?: { franchiseId?: string; search?: string }): LineDetailResponseDto[] {
    let result = [...linesStore];
    if (options?.franchiseId) {
      result = result.filter(l => l.franchiseId === options.franchiseId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.manufacturerName.toLowerCase().includes(q));
    }
    return result;
  },

  getLineDetail(id: string): LineDetailResponseDto | null {
    const key = `line:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return linesStore.find(l => l.id === id) || null;
  },

  // Characters
  getCharacters(options?: { franchiseId?: string; search?: string }): CharacterDetailResponseDto[] {
    let result = [...charactersStore];
    if (options?.franchiseId) {
      result = result.filter(c => c.franchiseId === options.franchiseId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return result;
  },

  getCharacterDetail(id: string): CharacterDetailResponseDto | null {
    const key = `character:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return charactersStore.find(c => c.id === id) || null;
  },

  // Figures
  getFigures(options?: { 
    lineId?: string; 
    franchiseId?: string; 
    characterId?: string; 
    search?: string;
    sortBy?: 'year' | 'name' | 'variants';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): { items: FigureSummaryDto[]; total: number; page: number; totalPages: number } {
    let list = [...figuresStore];

    if (options?.lineId) {
      list = list.filter(f => f.line.id === options.lineId);
    }
    if (options?.franchiseId) {
      const franchise = franchisesStore.find(f => f.id === options.franchiseId || f.slug === options.franchiseId);
      if (franchise) {
        list = list.filter(f => f.franchise.name.toLowerCase() === franchise.name.toLowerCase());
      }
    }
    if (options?.characterId) {
      list = list.filter(f => f.character.id === options.characterId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(f => 
        f.name.toLowerCase().includes(q) || 
        (f.code && f.code.toLowerCase().includes(q)) ||
        f.character.name.toLowerCase().includes(q)
      );
    }

    // Sort
    const order = options?.sortOrder === 'desc' ? -1 : 1;
    if (options?.sortBy === 'year') {
      list.sort((a, b) => (a.year - b.year) * order);
    } else if (options?.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name) * order);
    }

    const total = list.length;
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const items: FigureSummaryDto[] = paginated.map(f => ({
      id: f.id,
      name: f.name,
      code: f.code,
      imageUrl: f.imageUrl,
      lineId: f.line.id,
      lineName: f.line.name,
      characterId: f.character.id,
      characterName: f.character.name,
      year: f.year,
      variantsCount: f.variants.length,
      releasesCount: f.productReleases.length
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  getFigureDetail(id: string): FigureDetailResponseDto | null {
    const key = `figure:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    const found = figuresStore.find(f => f.id === id);
    if (found) {
      entityCache.set(key, found);
      return found;
    }
    return null;
  },

  // Variants
  getVariantDetail(id: string): VariantDetailResponseDto | null {
    const key = `variant:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return variantsStore.find(v => v.id === id) || null;
  },

  // Product Releases
  getProductReleaseDetail(id: string): ProductReleaseDetailResponseDto | null {
    const key = `product_release:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return productReleasesStore.find(r => r.id === id) || null;
  },

  // Manufacturers
  getManufacturers(): ManufacturerDetailResponseDto[] {
    return [...manufacturersStore];
  },

  getManufacturerDetail(id: string): ManufacturerDetailResponseDto | null {
    const key = `manufacturer:${id}`;
    if (entityCache.has(key)) return entityCache.get(key);
    return manufacturersStore.find(m => m.id === id) || null;
  },

  /**
   * Synchronous lookup across any entity type
   */
  getSyncEntityDetail(type: EntityType, id: string): any | null {
    switch (type) {
      case 'figure':
        return this.getFigureDetail(id);
      case 'line':
        return this.getLineDetail(id);
      case 'character':
        return this.getCharacterDetail(id);
      case 'franchise':
        return this.getFranchiseDetail(id);
      case 'variant':
        return this.getVariantDetail(id);
      case 'product_release':
        return this.getProductReleaseDetail(id);
      case 'manufacturer':
        return this.getManufacturerDetail(id);
      default:
        return null;
    }
  },

  /**
   * Asynchronous detail fetch that checks cache, sync store, and falls back to server API
   */
  async fetchEntityDetail(type: EntityType, id: string): Promise<any | null> {
    const cacheKey = `${type}:${id}`;
    if (entityCache.has(cacheKey)) {
      return entityCache.get(cacheKey);
    }

    const localDirect = this.getSyncEntityDetail(type, id);
    if (localDirect) {
      entityCache.set(cacheKey, localDirect);
      return localDirect;
    }

    try {
      const res = await fetch(`/api/catalog/${type}/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        entityCache.set(cacheKey, data);
        if (type === 'figure') {
          if (!figuresStore.some(f => f.id === data.id)) {
            figuresStore.push(data);
          }
        }
        return data;
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}/${id} from server:`, err);
    }

    return null;
  },

  /**
   * Universal Global Search
   * Searches across all domain tiers with verified clear support and rich categorical typing
   */
  globalSearch(query: string, typeFilter: EntityType | 'all' = 'all'): GlobalSearchResponseDto {
    const cleanQuery = (query || '').trim().toLowerCase();
    
    if (!cleanQuery) {
      return {
        query: '',
        total: 0,
        results: [],
        byTypeCount: {
          franchise: 0,
          manufacturer: 0,
          line: 0,
          character: 0,
          figure: 0,
          variant: 0,
          product_release: 0
        }
      };
    }

    const results: GlobalSearchResultItem[] = [];

    // 1. Search Franchises
    if (typeFilter === 'all' || typeFilter === 'franchise') {
      franchisesStore.forEach(f => {
        if (f.name.toLowerCase().includes(cleanQuery) || f.description.toLowerCase().includes(cleanQuery)) {
          results.push({
            id: f.id,
            type: 'franchise',
            title: f.name,
            subtitle: `Franchise • Est. ${f.originYear}`,
            meta: `${f.lines.length} Lines • ${f.totalFiguresCount} Catalogued Figures`,
            imageUrl: f.imageUrl,
            badgeText: 'Franchise',
            badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
            targetRoute: { type: 'franchise', id: f.id }
          });
        }
      });
    }

    // 2. Search Manufacturers
    if (typeFilter === 'all' || typeFilter === 'manufacturer') {
      manufacturersStore.forEach(m => {
        if (m.name.toLowerCase().includes(cleanQuery) || m.country.toLowerCase().includes(cleanQuery)) {
          results.push({
            id: m.id,
            type: 'manufacturer',
            title: m.name,
            subtitle: `Toy Maker • ${m.country} (Est. ${m.foundedYear})`,
            meta: `${m.linesProduced.length} Lines Produced`,
            imageUrl: m.imageUrl,
            badgeText: 'Manufacturer',
            badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
            targetRoute: { type: 'manufacturer', id: m.id }
          });
        }
      });
    }

    // 3. Search Lines
    if (typeFilter === 'all' || typeFilter === 'line') {
      linesStore.forEach(l => {
        if (
          l.name.toLowerCase().includes(cleanQuery) || 
          l.manufacturerName.toLowerCase().includes(cleanQuery) ||
          l.franchiseName.toLowerCase().includes(cleanQuery)
        ) {
          results.push({
            id: l.id,
            type: 'line',
            title: l.name,
            subtitle: `${l.franchiseName} Line • ${l.manufacturerName} (${l.startYear}${l.endYear ? `–${l.endYear}` : '–Present'})`,
            meta: `${l.totalFiguresCount} Figures • ${l.scale || 'Various Scale'}`,
            imageUrl: l.representativeImageUrl,
            badgeText: 'Line',
            badgeColor: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
            targetRoute: { type: 'line', id: l.id }
          });
        }
      });
    }

    // 4. Search Characters
    if (typeFilter === 'all' || typeFilter === 'character') {
      charactersStore.forEach(c => {
        if (
          c.name.toLowerCase().includes(cleanQuery) || 
          (c.species && c.species.toLowerCase().includes(cleanQuery)) ||
          (c.affiliation && c.affiliation.toLowerCase().includes(cleanQuery))
        ) {
          results.push({
            id: c.id,
            type: 'character',
            title: c.name,
            subtitle: `${c.franchiseName} Lore Entity • ${c.affiliation || 'Character'}`,
            meta: `${c.totalFiguresCount} Figure Appearances • ${c.variantsCount} Variants`,
            imageUrl: c.imageUrl,
            badgeText: 'Character',
            badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
            targetRoute: { type: 'character', id: c.id }
          });
        }
      });
    }

    // 5. Search Figures
    if (typeFilter === 'all' || typeFilter === 'figure') {
      figuresStore.forEach(f => {
        if (
          f.name.toLowerCase().includes(cleanQuery) || 
          (f.code && f.code.toLowerCase().includes(cleanQuery)) ||
          f.character.name.toLowerCase().includes(cleanQuery) ||
          f.line.name.toLowerCase().includes(cleanQuery)
        ) {
          results.push({
            id: f.id,
            type: 'figure',
            title: f.name,
            subtitle: `${f.line.name} (${f.year})`,
            meta: `${f.code ? `Code: ${f.code} • ` : ''}${f.variants.length} Variants • ${f.productReleases.length} Commercial Releases`,
            imageUrl: f.imageUrl,
            badgeText: 'Figure',
            badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
            targetRoute: { type: 'figure', id: f.id }
          });
        }
      });
    }

    // 6. Search Variants
    if (typeFilter === 'all' || typeFilter === 'variant') {
      variantsStore.forEach(v => {
        if (
          v.name.toLowerCase().includes(cleanQuery) || 
          v.distinguishingFeature.toLowerCase().includes(cleanQuery) ||
          v.associatedFigure.name.toLowerCase().includes(cleanQuery)
        ) {
          results.push({
            id: v.id,
            type: 'variant',
            title: v.name,
            subtitle: `Variant of ${v.associatedFigure.name} • ${v.rarityLevel}`,
            meta: v.distinguishingFeature,
            imageUrl: v.imageUrl,
            badgeText: `Variant: ${v.rarityLevel}`,
            badgeColor: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
            targetRoute: { type: 'variant', id: v.id }
          });
        }
      });
    }

    // 7. Search Product Releases
    if (typeFilter === 'all' || typeFilter === 'product_release') {
      productReleasesStore.forEach(r => {
        if (
          r.name.toLowerCase().includes(cleanQuery) || 
          (r.barcode && r.barcode.includes(cleanQuery)) ||
          r.packagingType.toLowerCase().includes(cleanQuery) ||
          r.parentFigure.name.toLowerCase().includes(cleanQuery)
        ) {
          results.push({
            id: r.id,
            type: 'product_release',
            title: r.name,
            subtitle: `${r.packagingType} • ${r.region} (${r.releaseYear})`,
            meta: `${r.barcode ? `UPC: ${r.barcode} • ` : ''}Exclusivity: ${r.retailerExclusivity || 'General Retail'}`,
            imageUrl: r.imageUrl,
            badgeText: 'Product Release',
            badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
            targetRoute: { type: 'product_release', id: r.id }
          });
        }
      });
    }

    // Count breakdown
    const byTypeCount: Record<EntityType, number> = {
      franchise: results.filter(r => r.type === 'franchise').length,
      manufacturer: results.filter(r => r.type === 'manufacturer').length,
      line: results.filter(r => r.type === 'line').length,
      character: results.filter(r => r.type === 'character').length,
      figure: results.filter(r => r.type === 'figure').length,
      variant: results.filter(r => r.type === 'variant').length,
      product_release: results.filter(r => r.type === 'product_release').length
    };

    return {
      query,
      total: results.length,
      results,
      byTypeCount
    };
  },

  // Real Gemini Multimodal AI Figure Identification
  async identifyFigureWithAi(imageBase64OrUrl: string): Promise<IdentifyFigureApiResponse> {
    try {
      const res = await fetch('/api/ai/identify-figure', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64OrUrl })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to identify figure');
      }
      return data;
    } catch (err: any) {
      console.error('AI Identification error:', err);
      throw err;
    }
  },

  // Optical Packaging Barcode Detection via Gemini Vision
  async detectBarcodeWithAi(imageBase64OrUrl: string): Promise<{
    success: boolean;
    barcode?: string | null;
    format?: string;
    figureName?: string;
    lineName?: string;
    details?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/scanner/detect-barcode', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64OrUrl })
      });
      return await res.json();
    } catch (err: any) {
      console.error('Barcode detection error:', err);
      return { success: false, details: err.message };
    }
  },

  // Live Online Barcode Validation & Matching
  async lookupBarcodeOnline(barcode: string): Promise<{
    found: boolean;
    isToyOrActionFigure: boolean;
    barcode: string;
    manufacturer: string | null;
    productName: string | null;
    notFoundReason: 'not_a_toy_manufacturer' | 'unregistered_barcode' | null;
    message: string;
    options: Array<{
      id: string;
      title: string;
      character: string;
      line: string;
      franchise: string;
      manufacturer: string;
      year: number;
      packagingType: string;
      region: string;
      assortmentSku?: string;
      description: string;
      imageUrl?: string;
      source: 'database' | 'curated_catalog' | 'gs1_registry' | 'online_archive';
      confidence: number;
      figureId?: string;
      releaseId?: string;
    }>;
  }> {
    try {
      const res = await fetch('/api/scanner/lookup-barcode-online', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcode.trim() })
      });
      return await res.json();
    } catch (err: any) {
      console.error('Online barcode lookup error:', err);
      return {
        found: false,
        isToyOrActionFigure: false,
        barcode,
        manufacturer: null,
        productName: null,
        notFoundReason: 'unregistered_barcode',
        message: err.message || 'Error en consultar el servei de codis de barres en línia.',
        options: []
      };
    }
  },

  // Immediate in-memory registration for newly proposed figures
  registerCommunityProposal(figure: {
    id: string;
    name: string;
    year: number;
    lineId: string;
    characterName?: string;
    condition?: string;
    conditionDetails?: string;
    barcode?: string;
    imageUrl?: string;
    description?: string;
  }): FigureDetailResponseDto {
    const line = linesStore.find(l => l.id === figure.lineId) || linesStore[0] || {
      id: figure.lineId,
      name: 'The Vintage Collection',
      franchiseId: 'fran-star-wars',
      franchiseName: 'Star Wars',
      manufacturerName: 'Kenner / Hasbro',
      startYear: figure.year
    };

    const conditionTag = figure.condition ? `Estat: ${figure.condition}${figure.conditionDetails ? ` (${figure.conditionDetails})` : ''}` : '';
    const newFig: FigureDetailResponseDto = {
      id: figure.id,
      name: figure.name,
      code: figure.barcode ? `BC-${figure.barcode.slice(-6)}` : `COMM-${Date.now().toString().slice(-4)}`,
      year: figure.year,
      description: [figure.description, conditionTag ? `[${conditionTag}]` : ''].filter(Boolean).join(' ') || `Community catalogued figure submitted by collector.`,
      imageUrl: figure.imageUrl || '/cardback_placeholder.jpeg',
      character: {
        id: `char-${figure.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`,
        name: figure.characterName || figure.name,
        description: `Character from ${line.franchiseName || 'Star Wars'} universe`,
        imageUrl: figure.imageUrl || '/cardback_placeholder.jpeg'
      },
      line: {
        id: line.id,
        name: line.name,
        manufacturerName: (line as any).manufacturerName || 'Hasbro / Kenner',
        startYear: (line as any).startYear || figure.year
      },
      franchise: {
        id: (line as any).franchiseId || 'fran-star-wars',
        name: (line as any).franchiseName || 'Star Wars'
      },
      sculptDetails: 'Community proposed casting entry',
      articulationPoints: 5,
      originalAccessories: ['Original accessories as recorded in proposal'],
      variants: [
        {
          id: `var-${figure.id}-std`,
          name: 'Standard Community Entry',
          figureId: figure.id,
          figureName: figure.name,
          distinguishingFeature: conditionTag || 'Community catalogued standard variant',
          isRare: false,
          imageUrl: figure.imageUrl || '/cardback_placeholder.jpeg'
        }
      ],
      productReleases: [
        {
          id: `rel-${figure.id}-orig`,
          name: `${figure.name} (${figure.condition || 'MOC'})`,
          figureId: figure.id,
          variantId: `var-${figure.id}-std`,
          packagingType: figure.condition === 'MOC' ? 'Blister Card (Mint on Card)' : (figure.condition === 'MIB' ? 'Sealed Box (MISB)' : 'Loose'),
          region: 'Community Archive',
          releaseYear: figure.year,
          imageUrl: figure.imageUrl || '/cardback_placeholder.jpeg',
          barcode: figure.barcode
        }
      ]
    };

    figuresStore = [newFig, ...figuresStore.filter(f => f.id !== newFig.id)];
    entityCache.set(`figure:${newFig.id}`, newFig);
    return newFig;
  }
};
