/**
 * Cardback - Action Figure Collector Platform
 * Domain Model & Public DTO Contracts
 */

export type EntityType = 
  | 'franchise'
  | 'manufacturer'
  | 'line'
  | 'character'
  | 'figure'
  | 'variant'
  | 'product_release';

export type FigureCondition = 
  | 'MOC' // Mint on Card / Mint in Box
  | 'LOOSE_COMPLETE' // Loose 100% complete with all accessories
  | 'LOOSE_INCOMPLETE' // Loose missing one or more accessories
  | 'GRADED' // Professionally graded (AFA, UKG, CAS)
  | 'CUSTOM';

export interface FranchiseSummaryDto {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  linesCount: number;
  figuresCount: number;
}

export interface ManufacturerSummaryDto {
  id: string;
  name: string;
  country: string;
  foundedYear: number;
  imageUrl?: string;
}

export interface LineSummaryDto {
  id: string;
  name: string;
  franchiseId: string;
  franchiseName: string;
  manufacturerName: string;
  startYear: number;
  endYear?: number;
  isActive: boolean;
  imageUrl: string;
  figuresCount: number;
}

export interface CharacterSummaryDto {
  id: string;
  name: string;
  franchiseName: string;
  imageUrl: string;
  figuresCount: number;
}

export interface FigureSummaryDto {
  id: string;
  name: string;
  code?: string;
  imageUrl: string;
  lineId: string;
  lineName: string;
  characterId: string;
  characterName: string;
  year: number;
  variantsCount: number;
  releasesCount: number;
}

export interface VariantSummaryDto {
  id: string;
  name: string;
  figureId: string;
  figureName: string;
  distinguishingFeature: string;
  imageUrl: string;
  isRare: boolean;
}

export interface ProductReleaseSummaryDto {
  id: string;
  name: string;
  figureId: string;
  variantId: string;
  packagingType: string;
  region: string;
  releaseYear: number;
  retailer?: string;
  imageUrl: string;
  barcode?: string;
}

// ==================== DETAIL RESPONSE DTOS ====================

export interface FranchiseDetailResponseDto {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  headerBannerUrl?: string;
  description: string;
  history: string;
  actionFigureLoreContext: string;
  originYear: number;
  creator: string;
  lines: LineSummaryDto[];
  keyCharacters: CharacterSummaryDto[];
  totalFiguresCount: number;
}

export interface ManufacturerDetailResponseDto {
  id: string;
  name: string;
  country: string;
  foundedYear: number;
  headquarters?: string;
  imageUrl: string;
  description: string;
  history: string;
  impactOnActionFigures: string;
  linesProduced: LineSummaryDto[];
}

export interface LineDetailResponseDto {
  id: string;
  name: string;
  logoUrl?: string;
  representativeImageUrl: string;
  franchiseId: string;
  franchiseName: string;
  manufacturerId: string;
  manufacturerName: string;
  startYear: number;
  endYear?: number;
  isActive: boolean;
  scale?: string;
  description: string;
  collectorNotes: string;
  totalFiguresCount: number;
  figures: FigureSummaryDto[];
}

export interface CharacterAppearanceDto {
  lineId: string;
  lineName: string;
  figureId: string;
  figureName: string;
  year: number;
  imageUrl: string;
  code?: string;
}

export interface CharacterDetailResponseDto {
  id: string;
  name: string;
  franchiseId: string;
  franchiseName: string;
  species?: string;
  homeworld?: string;
  affiliation?: string;
  description: string;
  imageUrl: string;
  firstLoreAppearance: string;
  firstFigureAppearance: {
    year: number;
    figureName: string;
    lineName: string;
    figureId: string;
  };
  appearancesAcrossLines: CharacterAppearanceDto[];
  totalFiguresCount: number;
  variantsCount: number;
  galleryUrls: string[];
}

export interface FigureDetailResponseDto {
  id: string;
  name: string;
  code?: string;
  year: number;
  description: string;
  imageUrl: string;
  character: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    affiliation?: string;
  };
  line: {
    id: string;
    name: string;
    manufacturerName: string;
    startYear: number;
    scale?: string;
  };
  franchise: {
    id: string;
    name: string;
  };
  sculptDetails: string;
  articulationPoints: number;
  originalAccessories: string[];
  variants: VariantSummaryDto[];
  productReleases: ProductReleaseSummaryDto[];
}

export interface VariantDetailResponseDto {
  id: string;
  name: string;
  imageUrl: string;
  distinguishingFeature: string;
  whyItMatters: string;
  identificationGuide: string;
  rarityLevel: 'Common' | 'Uncommon' | 'Rare' | 'Grail' | 'Proto / Error';
  associatedFigure: {
    id: string;
    name: string;
    code?: string;
    imageUrl: string;
    lineName: string;
    franchiseName: string;
  };
  accessoriesSpecific: string[];
  historicalDistributionNotes: string;
  firstAppearanceContext: string;
  photographs: { url: string; caption: string }[];
  releasesContainingVariant: ProductReleaseSummaryDto[];
}

export interface ProductReleaseDetailResponseDto {
  id: string;
  name: string;
  packagingType: string; // e.g., "12-Back Carded Blister", "Window Box", "Trilogo Card", "Mail-away Box"
  region: string; // US, Europe, Japan, Canada
  language: string;
  retailerExclusivity?: string; // General Retail, Target Exclusive, Walmart, Fan Club
  releaseDate: string;
  releaseYear: number;
  barcode?: string;
  assortmentNumber?: string;
  collectorNotes: string;
  imageUrl: string; // Product packaging photo
  backOfCardImageUrl?: string;
  associatedVariant: {
    id: string;
    name: string;
    distinguishingFeature: string;
  };
  parentFigure: {
    id: string;
    name: string;
    code?: string;
    imageUrl: string;
    lineName: string;
    franchiseName: string;
  };
  franchiseName: string;
  lineName: string;
}

// ==================== USER COLLECTION ====================

export interface OwnedFigure {
  id: string;
  userId: string;
  figureId: string;
  figureName: string;
  figureCode?: string;
  figureImageUrl: string;
  lineId: string;
  lineName: string;
  franchiseId: string;
  franchiseName: string;
  variantId?: string;
  variantName?: string;
  productReleaseId?: string;
  releasePackaging?: string;
  condition: FigureCondition;
  gradingScore?: string; // e.g. "AFA 85"
  purchasePrice: number;
  currency: string;
  estimatedValue: number;
  acquisitionDate: string;
  quantity: number;
  storageLocation: string; // e.g. "Display Shelf 2", "Protective Acrylic Case A", "Storage Box B"
  collectorNotes?: string;
  isWishlist?: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  addedAt: string;
}

export interface CollectionStats {
  totalOwned: number;
  totalUniqueFigures: number;
  totalEstimatedValue: number;
  totalInvested: number;
  mocCount: number;
  looseCount: number;
  gradedCount: number;
  franchiseBreakdown: { franchiseName: string; count: number; value: number }[];
  lineBreakdown: { lineName: string; count: number; totalInLine: number; percentage: number }[];
}

// ==================== GLOBAL SEARCH ====================

export interface GlobalSearchResultItem {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  meta: string;
  imageUrl: string;
  badgeText: string;
  badgeColor: string;
  targetRoute: {
    type: EntityType;
    id: string;
  };
}

export interface GlobalSearchResponseDto {
  query: string;
  total: number;
  results: GlobalSearchResultItem[];
  byTypeCount: Record<EntityType, number>;
}
