import pg from "pg";
import { STAR_WARS_LINES, STAR_WARS_FIGURES } from "./starWarsCatalogueData";

/**
 * Seeds Star Wars lines, characters, figures, variants, and product releases
 * into the Neon PostgreSQL database.
 */
export async function seedStarWarsCatalogue(pool: pg.Pool): Promise<{
  linesCount: number;
  figuresCount: number;
  charactersCount: number;
}> {
  console.log("Beginning Star Wars Historical Catalogue database seed...");

  // Helper to check existing table columns in PostgreSQL
  async function getTableColumns(tableName: string): Promise<Set<string>> {
    try {
      const res = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [tableName]
      );
      return new Set(res.rows.map(r => r.column_name));
    } catch (e) {
      return new Set();
    }
  }

  const franchiseCols = await getTableColumns("Franchise");
  const lineCols = await getTableColumns("Line");
  const characterCols = await getTableColumns("Character");
  const figureCols = await getTableColumns("Figure");
  const variantCols = await getTableColumns("Variant");
  const releaseCols = await getTableColumns("ProductRelease");
  const mfrCols = await getTableColumns("Manufacturer");

  // 1. Ensure Franchise exists using existing record if already present by name
  let franchiseId = 'fran-star-wars';
  const existingFranchiseRes = await pool.query(`SELECT id FROM "Franchise" WHERE name = 'Star Wars' LIMIT 1`);
  if (existingFranchiseRes.rows.length > 0) {
    franchiseId = existingFranchiseRes.rows[0].id;
  } else {
    if (franchiseCols.has("slug")) {
      const insRes = await pool.query(`
        INSERT INTO "Franchise" (id, name, slug, description, "createdAt", "updatedAt")
        VALUES (
          $1,
          'Star Wars',
          'star-wars',
          'The monumental space opera created by George Lucas that defined contemporary popular culture and single-handedly gave birth to modern action figure collecting.',
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET 
          description = EXCLUDED.description,
          "updatedAt" = NOW()
        RETURNING id;
      `, [franchiseId]);
      if (insRes.rows[0]) franchiseId = insRes.rows[0].id;
    } else {
      const insRes = await pool.query(`
        INSERT INTO "Franchise" (id, name, description, "createdAt", "updatedAt")
        VALUES (
          $1,
          'Star Wars',
          'The monumental space opera created by George Lucas that defined contemporary popular culture and single-handedly gave birth to modern action figure collecting.',
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET 
          description = EXCLUDED.description,
          "updatedAt" = NOW()
        RETURNING id;
      `, [franchiseId]);
      if (insRes.rows[0]) franchiseId = insRes.rows[0].id;
    }
  }

  // 2. Ensure Manufacturers exist using existing record if already present by name
  const manufacturers = [
    { id: 'mfr-kenner', name: 'Kenner Products', country: 'United States', foundedYear: 1946 },
    { id: 'mfr-hasbro', name: 'Hasbro', country: 'United States', foundedYear: 1923 }
  ];

  const mfrIdMap = new Map<string, string>();
  for (const m of manufacturers) {
    const existingMfr = await pool.query(`SELECT id FROM "Manufacturer" WHERE name = $1 LIMIT 1`, [m.name]);
    if (existingMfr.rows.length > 0) {
      mfrIdMap.set(m.id, existingMfr.rows[0].id);
    } else {
      if (mfrCols.has("foundedYear")) {
        await pool.query(`
          INSERT INTO "Manufacturer" (id, name, country, "foundedYear", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            country = EXCLUDED.country,
            "updatedAt" = NOW();
        `, [m.id, m.name, m.country, m.foundedYear]);
      } else {
        await pool.query(`
          INSERT INTO "Manufacturer" (id, name, country, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            country = EXCLUDED.country,
            "updatedAt" = NOW();
        `, [m.id, m.name, m.country]);
      }
      mfrIdMap.set(m.id, m.id);
    }
  }

  // 3. Upsert Lines (resolving manufacturerId and franchiseId)
  let linesCount = 0;
  for (const line of STAR_WARS_LINES) {
    const targetMfrId = mfrIdMap.get(line.manufacturerId) || line.manufacturerId;
    await pool.query(`
      INSERT INTO "Line" (
        id, name, "franchiseId", "manufacturerId", "startYear", "endYear", scale, description, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "startYear" = EXCLUDED."startYear",
        "endYear" = EXCLUDED."endYear",
        scale = EXCLUDED.scale,
        description = EXCLUDED.description,
        "updatedAt" = NOW();
    `, [
      line.id,
      line.name,
      franchiseId,
      targetMfrId,
      line.startYear,
      line.endYear || null,
      line.scale,
      line.description
    ]);
    linesCount++;
  }

  // 4. Upsert Characters and Figures
  let figuresCount = 0;
  const uniqueChars = new Map<string, { id: string; name: string; desc: string; affiliation?: string }>();

  for (const fig of STAR_WARS_FIGURES) {
    if (fig.character) {
      uniqueChars.set(fig.character.id, fig.character);
    }
  }

  const charIdMap = new Map<string, string>();
  for (const char of uniqueChars.values()) {
    const existingChar = await pool.query(
      `SELECT id FROM "Character" WHERE name = $1 AND "franchiseId" = $2 LIMIT 1`,
      [char.name, franchiseId]
    );

    if (existingChar.rows.length > 0) {
      charIdMap.set(char.id, existingChar.rows[0].id);
    } else {
      if (characterCols.has("affiliation")) {
        await pool.query(`
          INSERT INTO "Character" (
            id, name, "franchiseId", description, affiliation, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            affiliation = EXCLUDED.affiliation,
            "updatedAt" = NOW();
        `, [char.id, char.name, franchiseId, char.desc, char.affiliation || null]);
      } else {
        await pool.query(`
          INSERT INTO "Character" (
            id, name, "franchiseId", description, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            "updatedAt" = NOW();
        `, [char.id, char.name, franchiseId, char.desc]);
      }
      charIdMap.set(char.id, char.id);
    }
  }

  for (const fig of STAR_WARS_FIGURES) {
    const resolvedCharId = fig.character ? (charIdMap.get(fig.character.id) || fig.character.id) : null;
    await pool.query(`
      INSERT INTO "Figure" (
        id, name, code, "lineId", "characterId", description, "imageUrl", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        "lineId" = EXCLUDED."lineId",
        "characterId" = EXCLUDED."characterId",
        description = EXCLUDED.description,
        "imageUrl" = EXCLUDED."imageUrl",
        "updatedAt" = NOW();
    `, [
      fig.id,
      fig.name,
      fig.code || null,
      fig.lineId,
      resolvedCharId,
      fig.description,
      fig.imageUrl
    ]);

    // Create default Variant and Product Release so collectors can link ownership and barcodes
    const variantId = `var-${fig.id}-std`;
    await pool.query(`
      INSERT INTO "Variant" (
        id, "figureId", name, description, "imageUrl", "createdAt", "updatedAt"
      ) VALUES ($1, $2, 'Standard Production Run', $3, $4, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "updatedAt" = NOW();
    `, [
      variantId,
      fig.id,
      fig.sculptDetails || "Standard issue release",
      fig.imageUrl
    ]);

    const releaseId = `rel-${fig.id}-orig`;
    await pool.query(`
      INSERT INTO "ProductRelease" (
        id, "variantId", name, "packagingType", barcode, "releaseDate", region, "imageUrl", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, 'Blister Card', $4, $5, 'Global', $6, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        barcode = EXCLUDED.barcode,
        "imageUrl" = EXCLUDED."imageUrl",
        "updatedAt" = NOW();
    `, [
      releaseId,
      variantId,
      `${fig.name} Cardback Release`,
      fig.barcode || null,
      fig.year ? new Date(`${fig.year}-01-01`) : new Date('1980-01-01'),
      fig.imageUrl
    ]);

    figuresCount++;
  }

  console.log(`Seed complete: ${linesCount} lines, ${uniqueChars.size} characters, ${figuresCount} figures seeded into Neon.`);
  return {
    linesCount,
    figuresCount,
    charactersCount: uniqueChars.size
  };
}
