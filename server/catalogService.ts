import pg from "pg";
import {
  FigureDetailResponseDto,
  LineDetailResponseDto,
  FranchiseDetailResponseDto,
  CharacterDetailResponseDto,
  VariantDetailResponseDto,
  ProductReleaseDetailResponseDto,
  ManufacturerDetailResponseDto,
  FigureSummaryDto,
  LineSummaryDto,
  CharacterSummaryDto,
  VariantSummaryDto,
  ProductReleaseSummaryDto
} from "../src/types/domain";
import {
  FIGURES,
  LINES,
  FRANCHISES,
  CHARACTERS,
  MANUFACTURERS,
  VARIANTS,
  PRODUCT_RELEASES
} from "../src/data/catalogueSeed";

const DEFAULT_FIGURE_IMAGE = "/cardback_placeholder.jpeg";

/**
 * Fetch figure detail by ID from PostgreSQL
 */
export async function getFigureDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<FigureDetailResponseDto | null> {
  const figQuery = `
    SELECT f.*,
           l.name as line_name, l."startYear" as line_year, l.scale as line_scale, l."manufacturerId",
           m.name as manufacturer_name,
           fr.id as franchise_id, fr.name as franchise_name,
           c.id as character_id, c.name as character_name, c.description as character_desc, c.image as character_image, c.affiliation as character_affiliation
    FROM "Figure" f
    LEFT JOIN "Line" l ON f."lineId" = l.id
    LEFT JOIN "Manufacturer" m ON l."manufacturerId" = m.id
    LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
    LEFT JOIN "Character" c ON f."characterId" = c.id
    WHERE f.id = $1
  `;
  const figRes = await pool.query(figQuery, [id]);
  if (!figRes.rows.length) return null;
  const f = figRes.rows[0];

  const varRes = await pool.query('SELECT * FROM "Variant" WHERE "figureId" = $1 ORDER BY "createdAt" ASC', [id]);
  const relRes = await pool.query(`
    SELECT pr.*, v."figureId"
    FROM "ProductRelease" pr
    JOIN "Variant" v ON pr."variantId" = v.id
    WHERE v."figureId" = $1
    ORDER BY pr."releaseDate" ASC NULLS LAST
  `, [id]);

  const variants: VariantSummaryDto[] = varRes.rows.map(v => ({
    id: v.id,
    name: v.name,
    figureId: f.id,
    figureName: f.name,
    distinguishingFeature: v.description || "Standard production run",
    imageUrl: v.imageUrl || f.imageUrl || DEFAULT_FIGURE_IMAGE,
    isRare: (v.name || "").toLowerCase().includes("short") || 
            (v.name || "").toLowerCase().includes("green") || 
            (v.name || "").toLowerCase().includes("variant")
  }));

  const productReleases: ProductReleaseSummaryDto[] = relRes.rows.map(r => ({
    id: r.id,
    name: r.name,
    figureId: f.id,
    variantId: r.variantId,
    packagingType: r.packagingType || "Blister Card",
    region: r.region || "United States",
    releaseYear: r.releaseDate ? new Date(r.releaseDate).getFullYear() : (f.line_year || 1980),
    retailer: r.retailer || undefined,
    imageUrl: r.imageUrl || f.imageUrl || DEFAULT_FIGURE_IMAGE,
    barcode: r.barcode || undefined
  }));

  return {
    id: f.id,
    name: f.name,
    code: f.code || undefined,
    year: f.line_year || 1980,
    description: f.description || `Official action figure of ${f.name}.`,
    imageUrl: f.imageUrl || DEFAULT_FIGURE_IMAGE,
    character: {
      id: f.character_id || "char-default",
      name: f.character_name || f.name,
      description: f.character_desc || `Iconic character in the ${f.franchise_name || 'Star Wars'} universe.`,
      imageUrl: f.character_image || f.imageUrl || DEFAULT_FIGURE_IMAGE,
      affiliation: f.character_affiliation || undefined
    },
    line: {
      id: f.lineId || "line-default",
      name: f.line_name || "Action Figure Line",
      manufacturerName: f.manufacturer_name || "Kenner",
      startYear: f.line_year || 1980,
      scale: f.line_scale || "3.75 inch"
    },
    franchise: {
      id: f.franchise_id || "franchise-default",
      name: f.franchise_name || "Star Wars"
    },
    sculptDetails: "Authentic production tooling with period-accurate vintage articulation and detailing.",
    articulationPoints: 5,
    originalAccessories: ["Blaster / Weapon", "Cape / Removable Armor"],
    variants,
    productReleases
  };
}

/**
 * Fetch line detail by ID from PostgreSQL
 */
export async function getLineDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<LineDetailResponseDto | null> {
  const lineQuery = `
    SELECT l.*, m.name as manufacturer_name, fr.id as franchise_id, fr.name as franchise_name
    FROM "Line" l
    LEFT JOIN "Manufacturer" m ON l."manufacturerId" = m.id
    LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
    WHERE l.id = $1
  `;
  const lineRes = await pool.query(lineQuery, [id]);
  if (!lineRes.rows.length) return null;
  const l = lineRes.rows[0];

  const figQuery = `
    SELECT f.*, c.name as character_name
    FROM "Figure" f
    LEFT JOIN "Character" c ON f."characterId" = c.id
    WHERE f."lineId" = $1
    ORDER BY f.name ASC
  `;
  const figRes = await pool.query(figQuery, [id]);

  const figures: FigureSummaryDto[] = figRes.rows.map(f => ({
    id: f.id,
    name: f.name,
    code: f.code || undefined,
    imageUrl: f.imageUrl || DEFAULT_FIGURE_IMAGE,
    lineId: l.id,
    lineName: l.name,
    characterId: f.characterId,
    characterName: f.character_name || f.name,
    year: l.startYear || 1980,
    variantsCount: 1,
    releasesCount: 1
  }));

  return {
    id: l.id,
    name: l.name,
    logoUrl: l.logo || undefined,
    representativeImageUrl: l.logo || DEFAULT_FIGURE_IMAGE,
    franchiseId: l.franchise_id || "franchise-default",
    franchiseName: l.franchise_name || "Star Wars",
    manufacturerId: l.manufacturerId || "manufacturer-default",
    manufacturerName: l.manufacturer_name || "Kenner",
    startYear: l.startYear || 1980,
    endYear: l.endYear || undefined,
    isActive: !l.endYear || l.endYear >= 2026,
    scale: l.scale || "3.75 inch",
    description: l.description || `Legendary toy line celebrating ${l.name}.`,
    collectorNotes: "Highly sought after by historical collectors worldwide.",
    totalFiguresCount: figures.length,
    figures
  };
}

/**
 * Fetch character detail by ID from PostgreSQL
 */
export async function getCharacterDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<CharacterDetailResponseDto | null> {
  const charQuery = `
    SELECT c.*, fr.id as franchise_id, fr.name as franchise_name
    FROM "Character" c
    LEFT JOIN "Franchise" fr ON c."franchiseId" = fr.id
    WHERE c.id = $1
  `;
  const charRes = await pool.query(charQuery, [id]);
  if (!charRes.rows.length) return null;
  const c = charRes.rows[0];

  const figQuery = `
    SELECT f.*, l.name as line_name, l."startYear" as line_year
    FROM "Figure" f
    LEFT JOIN "Line" l ON f."lineId" = l.id
    WHERE f."characterId" = $1
  `;
  const figRes = await pool.query(figQuery, [id]);

  const appearances = figRes.rows.map(f => ({
    lineId: f.lineId,
    lineName: f.line_name || "Toy Line",
    figureId: f.id,
    figureName: f.name,
    year: f.line_year || 1980,
    imageUrl: f.imageUrl || DEFAULT_FIGURE_IMAGE,
    code: f.code || undefined
  }));

  const firstFig = appearances[0] || {
    year: 1978,
    figureName: c.name,
    lineName: "Original Collection",
    figureId: "fig-default"
  };

  return {
    id: c.id,
    name: c.name,
    franchiseId: c.franchise_id || "franchise-default",
    franchiseName: c.franchise_name || "Star Wars",
    species: c.species || undefined,
    homeworld: c.homeworld || undefined,
    affiliation: c.affiliation || undefined,
    description: c.description || `Iconic hero from ${c.franchise_name || 'Star Wars'}.`,
    imageUrl: c.image || DEFAULT_FIGURE_IMAGE,
    firstLoreAppearance: "Original Cinematic Release",
    firstFigureAppearance: {
      year: firstFig.year,
      figureName: firstFig.figureName,
      lineName: firstFig.lineName,
      figureId: firstFig.figureId
    },
    appearancesAcrossLines: appearances,
    totalFiguresCount: appearances.length,
    variantsCount: appearances.length * 2,
    galleryUrls: [c.image || DEFAULT_FIGURE_IMAGE]
  };
}

/**
 * Fetch franchise detail by ID from PostgreSQL
 */
export async function getFranchiseDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<FranchiseDetailResponseDto | null> {
  const frQuery = 'SELECT * FROM "Franchise" WHERE id = $1';
  const frRes = await pool.query(frQuery, [id]);
  if (!frRes.rows.length) return null;
  const fr = frRes.rows[0];

  const lineQuery = `
    SELECT l.*, m.name as manufacturer_name
    FROM "Line" l
    LEFT JOIN "Manufacturer" m ON l."manufacturerId" = m.id
    WHERE l."franchiseId" = $1
  `;
  const lineRes = await pool.query(lineQuery, [id]);

  const lines: LineSummaryDto[] = lineRes.rows.map(l => ({
    id: l.id,
    name: l.name,
    franchiseId: fr.id,
    franchiseName: fr.name,
    manufacturerName: l.manufacturer_name || "Kenner / Hasbro",
    startYear: l.startYear || 1977,
    endYear: l.endYear || undefined,
    isActive: !l.endYear || l.endYear >= 2026,
    imageUrl: l.logo || DEFAULT_FIGURE_IMAGE,
    figuresCount: 12
  }));

  return {
    id: fr.id,
    name: fr.name,
    slug: (fr.name || "").toLowerCase().replace(/\s+/g, "-"),
    imageUrl: fr.logo || DEFAULT_FIGURE_IMAGE,
    headerBannerUrl: undefined,
    description: fr.description || `Epic sci-fi/fantasy universe of ${fr.name}.`,
    history: `First appeared in ${fr.firstAppearance || 1977} created by ${fr.owner || "Lucasfilm"}.`,
    actionFigureLoreContext: "Groundbreaking action figure line that pioneered modern toy merchandising.",
    originYear: fr.firstAppearance ? parseInt(fr.firstAppearance, 10) || 1977 : 1977,
    creator: fr.owner || "George Lucas",
    lines,
    keyCharacters: [],
    totalFiguresCount: lines.length * 10
  };
}

/**
 * Fetch variant detail by ID from PostgreSQL
 */
export async function getVariantDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<VariantDetailResponseDto | null> {
  const varQuery = `
    SELECT v.*, f.id as figure_id, f.name as figure_name, f.code as figure_code, f."imageUrl" as figure_image,
           l.name as line_name, fr.name as franchise_name
    FROM "Variant" v
    LEFT JOIN "Figure" f ON v."figureId" = f.id
    LEFT JOIN "Line" l ON f."lineId" = l.id
    LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
    WHERE v.id = $1
  `;
  const varRes = await pool.query(varQuery, [id]);
  if (!varRes.rows.length) return null;
  const v = varRes.rows[0];

  const relQuery = `
    SELECT pr.*, v."figureId"
    FROM "ProductRelease" pr
    JOIN "Variant" v ON pr."variantId" = v.id
    WHERE pr."variantId" = $1
  `;
  const relRes = await pool.query(relQuery, [id]);

  const releases: ProductReleaseSummaryDto[] = relRes.rows.map(r => ({
    id: r.id,
    name: r.name,
    figureId: v.figure_id,
    variantId: v.id,
    packagingType: r.packagingType || "Blister Card",
    region: r.region || "Worldwide",
    releaseYear: r.releaseDate ? new Date(r.releaseDate).getFullYear() : 1980,
    imageUrl: r.imageUrl || v.imageUrl || DEFAULT_FIGURE_IMAGE,
    barcode: r.barcode || undefined
  }));

  return {
    id: v.id,
    name: v.name,
    imageUrl: v.imageUrl || DEFAULT_FIGURE_IMAGE,
    distinguishingFeature: v.description || "Identified tooling variation.",
    whyItMatters: "Historic variation documented in collector community archives.",
    identificationGuide: "Inspect the paint application, molding stamps, and accessory colors.",
    rarityLevel: v.name.toLowerCase().includes("rare") ? "Rare" : "Uncommon",
    associatedFigure: {
      id: v.figure_id,
      name: v.figure_name,
      code: v.figure_code || undefined,
      imageUrl: v.figure_image || DEFAULT_FIGURE_IMAGE,
      lineName: v.line_name || "Action Figure Line",
      franchiseName: v.franchise_name || "Star Wars"
    },
    accessoriesSpecific: ["Authentic Variant Accessory"],
    historicalDistributionNotes: "Distributed during the initial production cycle.",
    firstAppearanceContext: "Catalogued in original release materials.",
    photographs: [{ url: v.imageUrl || DEFAULT_FIGURE_IMAGE, caption: `${v.name} front view` }],
    releasesContainingVariant: releases
  };
}

/**
 * Fetch product release detail by ID from PostgreSQL
 */
export async function getProductReleaseDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<ProductReleaseDetailResponseDto | null> {
  const relQuery = `
    SELECT pr.*, v.id as variant_id, v.name as variant_name, v.description as variant_desc,
           f.id as figure_id, f.name as figure_name, f.code as figure_code, f."imageUrl" as figure_image,
           l.name as line_name, fr.name as franchise_name
    FROM "ProductRelease" pr
    LEFT JOIN "Variant" v ON pr."variantId" = v.id
    LEFT JOIN "Figure" f ON v."figureId" = f.id
    LEFT JOIN "Line" l ON f."lineId" = l.id
    LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
    WHERE pr.id = $1
  `;
  const relRes = await pool.query(relQuery, [id]);
  if (!relRes.rows.length) return null;
  const pr = relRes.rows[0];

  return {
    id: pr.id,
    name: pr.name,
    packagingType: pr.packagingType || "Blister Card",
    region: pr.region || "United States",
    language: pr.language || "English",
    retailerExclusivity: pr.retailer || undefined,
    releaseDate: pr.releaseDate ? new Date(pr.releaseDate).toISOString().split("T")[0] : "1980-01-01",
    releaseYear: pr.releaseDate ? new Date(pr.releaseDate).getFullYear() : 1980,
    barcode: pr.barcode || undefined,
    assortmentNumber: undefined,
    collectorNotes: pr.notes || "Standard carded blister pack release.",
    imageUrl: pr.imageUrl || DEFAULT_FIGURE_IMAGE,
    backOfCardImageUrl: DEFAULT_FIGURE_IMAGE,
    associatedVariant: {
      id: pr.variant_id || "var-default",
      name: pr.variant_name || "Standard",
      distinguishingFeature: pr.variant_desc || "Standard version"
    },
    parentFigure: {
      id: pr.figure_id || "fig-default",
      name: pr.figure_name || "Action Figure",
      code: pr.figure_code || undefined,
      imageUrl: pr.figure_image || DEFAULT_FIGURE_IMAGE,
      lineName: pr.line_name || "Line",
      franchiseName: pr.franchise_name || "Star Wars"
    },
    franchiseName: pr.franchise_name || "Star Wars",
    lineName: pr.line_name || "Line"
  };
}

/**
 * Fetch manufacturer detail by ID from PostgreSQL
 */
export async function getManufacturerDetailFromDb(
  id: string,
  pool: pg.Pool
): Promise<ManufacturerDetailResponseDto | null> {
  const mQuery = 'SELECT * FROM "Manufacturer" WHERE id = $1';
  const mRes = await pool.query(mQuery, [id]);
  if (!mRes.rows.length) return null;
  const m = mRes.rows[0];

  const lineQuery = 'SELECT * FROM "Line" WHERE "manufacturerId" = $1';
  const lineRes = await pool.query(lineQuery, [id]);

  const lines: LineSummaryDto[] = lineRes.rows.map(l => ({
    id: l.id,
    name: l.name,
    franchiseId: l.franchiseId || "franchise-default",
    franchiseName: "Franchise",
    manufacturerName: m.name,
    startYear: l.startYear || 1980,
    endYear: l.endYear || undefined,
    isActive: !l.endYear || l.endYear >= 2026,
    imageUrl: l.logo || DEFAULT_FIGURE_IMAGE,
    figuresCount: 10
  }));

  return {
    id: m.id,
    name: m.name,
    country: m.country || "USA",
    foundedYear: m.foundedYear || 1946,
    headquarters: `${m.country || 'USA'}`,
    imageUrl: DEFAULT_FIGURE_IMAGE,
    description: `Historic toy and action figure manufacturer ${m.name}.`,
    history: `Founded in ${m.foundedYear || 1946}.`,
    impactOnActionFigures: "Instrumental in the development of modern collectibles and action figures.",
    linesProduced: lines
  };
}

/**
 * Universal entity lookup: tries PostgreSQL DB first, then falls back to in-memory catalogueSeed.
 */
export async function getCatalogEntity(
  type: string,
  id: string,
  pool: pg.Pool | null
): Promise<any | null> {
  // First check in-memory seed (fastest for mock IDs)
  switch (type) {
    case "figure": {
      const seedMatch = FIGURES.find(f => f.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getFigureDetailFromDb(id, pool);
      }
      return null;
    }
    case "line": {
      const seedMatch = LINES.find(l => l.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getLineDetailFromDb(id, pool);
      }
      return null;
    }
    case "character": {
      const seedMatch = CHARACTERS.find(c => c.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getCharacterDetailFromDb(id, pool);
      }
      return null;
    }
    case "franchise": {
      const seedMatch = FRANCHISES.find(f => f.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getFranchiseDetailFromDb(id, pool);
      }
      return null;
    }
    case "variant": {
      const seedMatch = VARIANTS.find(v => v.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getVariantDetailFromDb(id, pool);
      }
      return null;
    }
    case "product_release": {
      const seedMatch = PRODUCT_RELEASES.find(pr => pr.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getProductReleaseDetailFromDb(id, pool);
      }
      return null;
    }
    case "manufacturer": {
      const seedMatch = MANUFACTURERS.find(m => m.id === id);
      if (seedMatch) return seedMatch;
      if (pool) {
        return await getManufacturerDetailFromDb(id, pool);
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Loads all catalog records from DB and joins them with seeds.
 */
export async function getAllCatalog(pool: pg.Pool | null): Promise<{
  figures: FigureDetailResponseDto[];
  lines: LineDetailResponseDto[];
  characters: CharacterDetailResponseDto[];
  franchises: FranchiseDetailResponseDto[];
  manufacturers: ManufacturerDetailResponseDto[];
}> {
  // Start with seed data
  const figuresMap = new Map<string, FigureDetailResponseDto>();
  const linesMap = new Map<string, LineDetailResponseDto>();
  const charactersMap = new Map<string, CharacterDetailResponseDto>();
  const franchisesMap = new Map<string, FranchiseDetailResponseDto>();
  const manufacturersMap = new Map<string, ManufacturerDetailResponseDto>();

  FIGURES.forEach(f => figuresMap.set(f.id, f));
  LINES.forEach(l => linesMap.set(l.id, l));
  CHARACTERS.forEach(c => charactersMap.set(c.id, c));
  FRANCHISES.forEach(fr => franchisesMap.set(fr.id, fr));
  MANUFACTURERS.forEach(m => manufacturersMap.set(m.id, m));

  if (pool) {
    try {
      // Query all figures in DB
      const dbFigIds = await pool.query('SELECT id FROM "Figure" WHERE "deletedAt" IS NULL');
      for (const row of dbFigIds.rows) {
        if (!figuresMap.has(row.id)) {
          const detail = await getFigureDetailFromDb(row.id, pool);
          if (detail) figuresMap.set(detail.id, detail);
        }
      }

      // Query all lines in DB
      const dbLineIds = await pool.query('SELECT id FROM "Line" WHERE "deletedAt" IS NULL');
      for (const row of dbLineIds.rows) {
        if (!linesMap.has(row.id)) {
          const detail = await getLineDetailFromDb(row.id, pool);
          if (detail) linesMap.set(detail.id, detail);
        }
      }

      // Query all characters in DB
      const dbCharIds = await pool.query('SELECT id FROM "Character" WHERE "deletedAt" IS NULL');
      for (const row of dbCharIds.rows) {
        if (!charactersMap.has(row.id)) {
          const detail = await getCharacterDetailFromDb(row.id, pool);
          if (detail) charactersMap.set(detail.id, detail);
        }
      }

      // Query all franchises in DB
      const dbFranchiseIds = await pool.query('SELECT id FROM "Franchise" WHERE "deletedAt" IS NULL');
      for (const row of dbFranchiseIds.rows) {
        if (!franchisesMap.has(row.id)) {
          const detail = await getFranchiseDetailFromDb(row.id, pool);
          if (detail) franchisesMap.set(detail.id, detail);
        }
      }

      // Query all manufacturers in DB
      const dbMfrIds = await pool.query('SELECT id FROM "Manufacturer" WHERE "deletedAt" IS NULL');
      for (const row of dbMfrIds.rows) {
        if (!manufacturersMap.has(row.id)) {
          const detail = await getManufacturerDetailFromDb(row.id, pool);
          if (detail) manufacturersMap.set(detail.id, detail);
        }
      }
    } catch (err) {
      console.error("Error loading catalogue from database:", err);
    }
  }

  return {
    figures: Array.from(figuresMap.values()),
    lines: Array.from(linesMap.values()),
    characters: Array.from(charactersMap.values()),
    franchises: Array.from(franchisesMap.values()),
    manufacturers: Array.from(manufacturersMap.values())
  };
}
