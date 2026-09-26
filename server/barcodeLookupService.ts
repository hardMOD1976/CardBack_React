import pg from "pg";
import { GoogleGenAI } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;
function getGenAiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

export interface BarcodeMatchOption {
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
  source: "database" | "curated_catalog" | "gs1_registry" | "online_archive";
  confidence: number;
  figureId?: string;
  releaseId?: string;
}

export interface BarcodeLookupResponse {
  found: boolean;
  isToyOrActionFigure: boolean;
  barcode: string;
  manufacturer: string | null;
  productName: string | null;
  notFoundReason: "not_a_toy_manufacturer" | "unregistered_barcode" | null;
  message: string;
  options: BarcodeMatchOption[];
}

/**
 * Recognized GS1 company prefixes for official action figure and toy manufacturers.
 */
export const TOY_MANUFACTURER_PREFIXES: Record<string, { manufacturer: string; knownLines: string[]; primaryFranchises: string[] }> = {
  // Kenner & Hasbro
  "076281": { manufacturer: "Kenner Products / Hasbro", knownLines: ["The Power of the Force 2", "Vintage Collection", "Batman: The Animated Series", "Jurassic Park", "Shadows of the Empire"], primaryFranchises: ["Star Wars", "DC Comics", "Jurassic Park"] },
  "653569": { manufacturer: "Hasbro", knownLines: ["The Vintage Collection", "The Black Series", "Marvel Legends", "Transformers Generations", "G.I. Joe Classified"], primaryFranchises: ["Star Wars", "Marvel", "Transformers", "G.I. Joe"] },
  "501099": { manufacturer: "Hasbro UK / International", knownLines: ["Star Wars Tri-Logo / European Assortment", "Action Man", "Marvel Legends EU"], primaryFranchises: ["Star Wars", "Marvel", "Action Man"] },
  
  // Mattel
  "074299": { manufacturer: "Mattel", knownLines: ["Masters of the Universe Vintage", "DC Universe Classics", "Hot Wheels", "Secret Wars"], primaryFranchises: ["Masters of the Universe", "DC Comics", "Marvel (Vintage)"] },
  "887961": { manufacturer: "Mattel", knownLines: ["Masters of the Universe Origins", "Masterverse", "WWE Elite Collection", "Jurassic World Amber Collection"], primaryFranchises: ["Masters of the Universe", "WWE", "Jurassic World"] },
  "027084": { manufacturer: "Mattel", knownLines: ["Batman Action Figures", "DC Super Heroes", "Max Steel"], primaryFranchises: ["DC Comics", "Max Steel"] },
  
  // Playmates Toys
  "043377": { manufacturer: "Playmates Toys", knownLines: ["Teenage Mutant Ninja Turtles (1988-1997)", "Star Trek", "The Simpsons World of Springfield"], primaryFranchises: ["Teenage Mutant Ninja Turtles", "Star Trek", "The Simpsons"] },
  "035583": { manufacturer: "Playmates Toys", knownLines: ["TMNT Classic Collection", "Godzilla vs Kong"], primaryFranchises: ["Teenage Mutant Ninja Turtles", "Godzilla"] },

  // Toy Biz
  "038976": { manufacturer: "Toy Biz", knownLines: ["Marvel Super Heroes", "X-Men", "Spider-Man Classics", "The Lord of the Rings"], primaryFranchises: ["Marvel", "The Lord of the Rings"] },

  // McFarlane Toys
  "787926": { manufacturer: "McFarlane Toys", knownLines: ["Spawn", "DC Multiverse", "Movie Maniacs", "Warhammer 40,000"], primaryFranchises: ["Spawn", "DC Comics", "Warhammer"] },

  // NECA
  "634482": { manufacturer: "NECA", knownLines: ["Ultimate Action Figures", "TMNT Cartoon & Movie", "Predator", "Alien", "Universal Monsters"], primaryFranchises: ["Teenage Mutant Ninja Turtles", "Predator", "Alien", "Horror / Sci-Fi"] },

  // Super7
  "840049": { manufacturer: "Super7", knownLines: ["ReAction Figures (3.75-inch)", "Ultimates! 7-inch"], primaryFranchises: ["Transformers", "G.I. Joe", "TMNT", "ThunderCats", "SilverHawks"] },

  // Funko
  "889698": { manufacturer: "Funko", knownLines: ["Pop! Vinyl", "Funko 3.75 Savage World", "Action Figures"], primaryFranchises: ["Star Wars", "Marvel", "DC", "Anime", "Pop Culture"] },

  // Bandai / Tamashii
  "454966": { manufacturer: "Bandai / Tamashii Nations", knownLines: ["S.H. Figuarts", "Manga Realization", "Movie Realization", "Gundam Universe"], primaryFranchises: ["Star Wars", "Dragon Ball", "Marvel", "Gundam"] },
  "457310": { manufacturer: "Bandai Spirits", knownLines: ["S.H. Figuarts", "Robot Spirits", "Ichibansho"], primaryFranchises: ["Anime", "Star Wars", "Marvel"] },

  // LJN / Galoob / Mego
  "024508": { manufacturer: "LJN Toys", knownLines: ["ThunderCats", "WWF Wrestling Superstars"], primaryFranchises: ["ThunderCats", "WWF"] },
  "080334": { manufacturer: "Lewis Galoob Toys", knownLines: ["Micro Machines", "Star Wars Action Fleet", "Biker Mice from Mars"], primaryFranchises: ["Star Wars", "Micro Machines"] },
  "021137": { manufacturer: "Mego Corporation", knownLines: ["World's Greatest Super-Heroes (WGSH)", "Star Trek 8-inch", "Action Jackson"], primaryFranchises: ["DC Comics", "Marvel", "Star Trek"] },

  // Mezco
  "695726": { manufacturer: "Mezco Toyz", knownLines: ["One:12 Collective", "Living Dead Dolls", "5 Points"], primaryFranchises: ["DC Comics", "Marvel", "Rumble Society"] },

  // LEGO
  "570201": { manufacturer: "LEGO", knownLines: ["LEGO Minifigures", "Star Wars Buildable Figures"], primaryFranchises: ["Star Wars", "Marvel", "DC", "LEGO"] },

  // Playmobil
  "400878": { manufacturer: "Playmobil (Geobra Brandstätter)", knownLines: ["Playmobil Figures", "Playmobil Special Plus"], primaryFranchises: ["Playmobil", "Ghostbusters", "Back to the Future"] }
};

/**
 * Checks if a barcode matches Open Food Facts or Open Beauty Facts (groceries, cosmetics, detergents).
 */
async function checkNonToyFoodOrCosmetics(barcode: string): Promise<{ isNonToy: boolean; product?: any } | null> {
  try {
    const clean = barcode.trim();
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${clean}.json`, {
      headers: { "User-Agent": "CardbackArchivist/1.0 (collector@cardback.app)" }
    });
    const data = await res.json();
    if (data && data.status === 1 && data.product) {
      return { isNonToy: true, product: data.product };
    }
  } catch (e) {
    // Ignore network error in quick check
  }

  try {
    const clean = barcode.trim();
    const res = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${clean}.json`, {
      headers: { "User-Agent": "CardbackArchivist/1.0 (collector@cardback.app)" }
    });
    const data = await res.json();
    if (data && data.status === 1 && data.product) {
      return { isNonToy: true, product: data.product };
    }
  } catch (e) {
    // Ignore
  }

  return null;
}

/**
 * Searches the local PostgreSQL database for an exact ProductRelease match by barcode.
 */
async function searchDatabaseReleases(barcode: string, pool: pg.Pool | null): Promise<BarcodeMatchOption[]> {
  if (!pool) return [];
  const clean = barcode.trim();
  const cleanNoLeadingZero = clean.replace(/^0+/, "");

  try {
    const query = `
      SELECT pr.id as "releaseId", pr.name as "releaseName", pr."packagingType", pr.region, pr.language,
             pr."releaseYear", pr.barcode, pr."collectorNotes", pr."retailerExclusivity", pr."imageUrl" as "releaseImageUrl",
             v.id as "variantId", v.name as "variantName", v."distinguishingFeature",
             f.id as "figureId", f.name as "figureName", f.code as "figureCode", f.year as "figureYear", f."imageUrl" as "figureImageUrl",
             l.name as "lineName", fr.name as "franchiseName", m.name as "manufacturerName"
      FROM "ProductRelease" pr
      LEFT JOIN "Variant" v ON pr."variantId" = v.id
      LEFT JOIN "Figure" f ON v."figureId" = f.id
      LEFT JOIN "Line" l ON f."lineId" = l.id
      LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
      LEFT JOIN "Manufacturer" m ON l."manufacturerId" = m.id
      WHERE pr.barcode = $1 OR pr.barcode = $2
      ORDER BY pr."releaseYear" ASC;
    `;
    const result = await pool.query(query, [clean, cleanNoLeadingZero]);
    if (result.rows.length === 0) return [];

    return result.rows.map(row => ({
      id: row.releaseId,
      releaseId: row.releaseId,
      figureId: row.figureId,
      title: `${row.figureName} (${row.releaseName || row.packagingType})`,
      character: row.figureName,
      line: row.lineName || "Vintage Collection",
      franchise: row.franchiseName || "Star Wars",
      manufacturer: row.manufacturerName || "Hasbro / Kenner",
      year: row.releaseYear || row.figureYear || 1995,
      packagingType: row.packagingType || "Carded Blister (MOC)",
      region: row.region || "North America",
      assortmentSku: row.collectorNotes || undefined,
      description: `Official archive release: ${row.releaseName}. Variant: ${row.variantName || 'Standard'}. Packaging: ${row.packagingType}.`,
      imageUrl: row.releaseImageUrl || row.figureImageUrl || "/cardback_placeholder.jpeg",
      source: "database",
      confidence: 1.0
    }));
  } catch (err) {
    console.error("Database barcode query error:", err);
    return [];
  }
}

/**
 * Searches the curated static sample catalogue (POTF2 Vader, TMNT Leo, MOTU Skeletor, etc.).
 */
function searchCuratedCatalogue(barcode: string): BarcodeMatchOption[] {
  const clean = barcode.trim();
  const samples: Record<string, BarcodeMatchOption[]> = {
    "076281695701": [
      {
        id: "rel-sw-vader-potf2-red-us",
        releaseId: "rel-sw-vader-potf2-red-us",
        figureId: "fig-sw-vader-potf2",
        title: "Darth Vader (POTF2 Red Card US)",
        character: "Darth Vader",
        line: "Star Wars: The Power of the Force 2",
        franchise: "Star Wars",
        manufacturer: "Kenner / Hasbro",
        year: 1995,
        packagingType: "Blister Cardback (Red Card / European Peg)",
        region: "United States / North America",
        assortmentSku: "69570 / 69590",
        description: "Original 1995 Kenner red blister card featuring red photo backdrop and classic hologram foil sticker.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.99
      },
      {
        id: "rel-sw-vader-potf2-short-saber",
        releaseId: "rel-sw-vader-potf2-red-us",
        figureId: "fig-sw-vader-potf2",
        title: "Darth Vader (POTF2 Short Lightsaber Variant)",
        character: "Darth Vader",
        line: "Star Wars: The Power of the Force 2",
        franchise: "Star Wars",
        manufacturer: "Kenner / Hasbro",
        year: 1995,
        packagingType: "Blister Cardback (Red Card - Short Saber Transition)",
        region: "United States (Early Wave 1)",
        assortmentSku: "69570",
        description: "Early Wave 1 packaging transition featuring the shorter lightsaber blade accessory.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.96
      }
    ],
    "076281695909": [
      {
        id: "rel-sw-vader-potf2-green-us",
        releaseId: "rel-sw-vader-potf2-green-us",
        figureId: "fig-sw-vader-potf2",
        title: "Darth Vader (POTF2 Green Card US with Hologram)",
        character: "Darth Vader",
        line: "Star Wars: The Power of the Force 2",
        franchise: "Star Wars",
        manufacturer: "Kenner / Hasbro",
        year: 1996,
        packagingType: "Blister Cardback (Green Card / Hologram)",
        region: "United States / Canada",
        assortmentSku: "69570 / 69590",
        description: "1996 Kenner packaging revision on green cardback with foil hologram.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.99
      }
    ],
    "043377050019": [
      {
        id: "rel-tmnt-leo-10back-us",
        releaseId: "rel-tmnt-leo-10back-us",
        figureId: "fig-tmnt-leo-vintage",
        title: "Leonardo (1988 10-Back Soft Head)",
        character: "Leonardo",
        line: "Teenage Mutant Ninja Turtles Vintage",
        franchise: "Teenage Mutant Ninja Turtles",
        manufacturer: "Playmates Toys",
        year: 1988,
        packagingType: "10-Back Blister Card",
        region: "United States",
        assortmentSku: "5001",
        description: "Original 1988 first-run packaging featuring the iconic soft rubber head molding and 10-back collector checklist.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.99
      },
      {
        id: "rel-tmnt-leo-hard-head",
        releaseId: "rel-tmnt-leo-10back-us",
        figureId: "fig-tmnt-leo-vintage",
        title: "Leonardo (1989 Hard Head Revision)",
        character: "Leonardo",
        line: "Teenage Mutant Ninja Turtles Vintage",
        franchise: "Playmates Toys",
        manufacturer: "Playmates Toys",
        year: 1989,
        packagingType: "10-Back / Fan Club Offer Card",
        region: "North America",
        assortmentSku: "5001",
        description: "Second production run featuring durable hard plastic head sculpt.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.95
      }
    ],
    "074299044237": [
      {
        id: "rel-motu-skeletor-8back",
        releaseId: "rel-motu-skeletor-8back",
        figureId: "fig-motu-skeletor-vintage",
        title: "Skeletor (1982 8-Back Vintage Card)",
        character: "Skeletor",
        line: "Masters of the Universe Vintage",
        franchise: "Masters of the Universe",
        manufacturer: "Mattel",
        year: 1982,
        packagingType: "8-Back Vintage Cardback (US)",
        region: "United States",
        assortmentSku: "4423",
        description: "First release 1982 8-back cardback with original cross-sell art and minicomic included.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "curated_catalog",
        confidence: 0.99
      }
    ]
  };

  return samples[clean] || [];
}

/**
 * Main entrance: Looks up a barcode across online sources and collector archives.
 * Returns NOT FOUND if not from an action figure/toy manufacturer.
 * Returns match options if verified as a toy manufacturer release.
 */
export async function lookupBarcodeOnline(
  barcodeRaw: string,
  pool: pg.Pool | null
): Promise<BarcodeLookupResponse> {
  const barcode = (barcodeRaw || "").trim();

  if (!barcode || barcode.length < 6) {
    return {
      found: false,
      isToyOrActionFigure: false,
      barcode,
      manufacturer: null,
      productName: null,
      notFoundReason: "unregistered_barcode",
      message: "Codi de barres invàlid o massa curt.",
      options: []
    };
  }

  // 1. Check if it's a known food or beauty/cosmetic product via open databases
  const nonToyCheck = await checkNonToyFoodOrCosmetics(barcode);
  if (nonToyCheck && nonToyCheck.isNonToy) {
    const brand = nonToyCheck.product?.brands || nonToyCheck.product?.brand_owner || "Gran Consum";
    const name = nonToyCheck.product?.product_name || "Producte no catalogat com a joguina";
    return {
      found: false,
      isToyOrActionFigure: false,
      barcode,
      manufacturer: brand,
      productName: name,
      notFoundReason: "not_a_toy_manufacturer",
      message: `El codi de barres correspon a un producte de consum / alimentació (${name} - ${brand}), no a cap fabricant de figures d'acció o joguines (Not Found).`,
      options: []
    };
  }

  // 2. Check local PostgreSQL database
  const dbOptions = await searchDatabaseReleases(barcode, pool);
  if (dbOptions.length > 0) {
    return {
      found: true,
      isToyOrActionFigure: true,
      barcode,
      manufacturer: dbOptions[0].manufacturer,
      productName: dbOptions[0].title,
      notFoundReason: null,
      message: `S'han trobat ${dbOptions.length} concordances exactes a l'arxiu Cardback.`,
      options: dbOptions
    };
  }

  // 3. Check curated static archive
  const curatedOptions = searchCuratedCatalogue(barcode);
  if (curatedOptions.length > 0) {
    return {
      found: true,
      isToyOrActionFigure: true,
      barcode,
      manufacturer: curatedOptions[0].manufacturer,
      productName: curatedOptions[0].title,
      notFoundReason: null,
      message: `S'han trobat ${curatedOptions.length} opcions catalogades a l'arxiu històric.`,
      options: curatedOptions
    };
  }

  // 4. Check GS1 manufacturer prefix table
  const prefix6 = barcode.slice(0, 6);
  const prefix7 = barcode.slice(0, 7);
  const matchedPrefix = TOY_MANUFACTURER_PREFIXES[prefix6] || TOY_MANUFACTURER_PREFIXES[prefix7];

  // 5. Query Gemini collector intelligence to verify manufacturer and online matching options
  try {
    const ai = getGenAiClient();
    const prompt = `You are an expert action figure archivist and toy cataloguer (specialized in Kenner, Hasbro, Mattel, Playmates, NECA, McFarlane, Bandai, Super7, MEGO, Funko).
A collector scanned barcode UPC/EAN: "${barcode}".
Known GS1 toy manufacturer hint for prefix "${prefix6}": ${matchedPrefix ? matchedPrefix.manufacturer + ' (Lines: ' + matchedPrefix.knownLines.join(', ') + ')' : 'None known'}.

TASK:
1. Determine if this barcode belongs to an ACTION FIGURE or TOY manufacturer.
   - If it belongs to food, beverage, clothes, books, automotive, cleaning supplies, electronics, or an unregistered/unknown company: "isToyOrActionFigure" MUST BE FALSE.
   - If it belongs to a verified toy/figure manufacturer (e.g. Kenner, Hasbro, Mattel, Playmates, NECA, McFarlane, Bandai, Funko, Super7, LEGO, etc.): "isToyOrActionFigure" is TRUE.
2. If "isToyOrActionFigure" is true:
   Provide the specific action figure or toy release options referencing this packaging or UPC assortment (e.g., specific character, packaging cardback, wave, release year, regional variations).

Respond in strict JSON with NO markdown formatting:
{
  "isToyOrActionFigure": true or false,
  "manufacturer": "string or null",
  "productName": "string or null",
  "confidence": 0.95,
  "notFoundReason": "not_a_toy_manufacturer" or "unregistered_barcode" or null,
  "options": [
    {
      "id": "opt-1",
      "title": "Character Name (Edition Name)",
      "character": "Character Name",
      "line": "Toy Line Name",
      "franchise": "Franchise Name",
      "manufacturer": "Manufacturer Name",
      "year": 1995,
      "packagingType": "Cardback / Blister / Boxed",
      "region": "US / Global",
      "assortmentSku": "SKU #",
      "description": "Packaging and molding details"
    }
  ]
}`;

    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let responseText = "";

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} error in barcode lookup:`, err.message);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText.replace(/```json/gi, "").replace(/```/g, "").trim());

      // If AI determined it's NOT a toy manufacturer, or if matchedPrefix was not found and confidence is low
      if (!parsed.isToyOrActionFigure) {
        return {
          found: false,
          isToyOrActionFigure: false,
          barcode,
          manufacturer: parsed.manufacturer || null,
          productName: parsed.productName || null,
          notFoundReason: "not_a_toy_manufacturer",
          message: parsed.productName
            ? `El codi de barres correspon a "${parsed.productName}" (${parsed.manufacturer || 'Desconegut'}), que no és cap fabricant de figures o joguines (Not Found).`
            : "Aquest codi de barres no pertany a cap fabricant de figures o joguines catalogat (Not Found).",
          options: []
        };
      }

      // If it IS a toy manufacturer
      const mappedOptions: BarcodeMatchOption[] = (parsed.options || []).map((opt: any, idx: number) => ({
        id: opt.id || `opt-${barcode}-${idx + 1}`,
        title: opt.title || `${opt.character || 'Figura'} (${opt.line || 'Toy Line'})`,
        character: opt.character || opt.title || "Personatge",
        line: opt.line || "Toy Collection",
        franchise: opt.franchise || "Action Figures",
        manufacturer: opt.manufacturer || matchedPrefix?.manufacturer || "Hasbro / Kenner",
        year: typeof opt.year === "number" ? opt.year : 2000,
        packagingType: opt.packagingType || "Cardback Blister (MOC)",
        region: opt.region || "Global",
        assortmentSku: opt.assortmentSku || undefined,
        description: opt.description || "Identificació de packaging referenciada en catàlegs de joguines.",
        imageUrl: "/cardback_placeholder.jpeg",
        source: "online_archive",
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.90
      }));

      if (mappedOptions.length > 0) {
        return {
          found: true,
          isToyOrActionFigure: true,
          barcode,
          manufacturer: parsed.manufacturer || matchedPrefix?.manufacturer || mappedOptions[0].manufacturer,
          productName: parsed.productName || mappedOptions[0].title,
          notFoundReason: null,
          message: `S'han trobat ${mappedOptions.length} opcions referenciades a la xarxa per a aquest fabricant.`,
          options: mappedOptions
        };
      }
    }
  } catch (err: any) {
    console.error("Gemini barcode lookup error:", err);
  }

  // 6. If matchedPrefix exists but no specific options were resolved
  if (matchedPrefix) {
    const defaultOption: BarcodeMatchOption = {
      id: `opt-${barcode}-prefix`,
      title: `${matchedPrefix.manufacturer} Assortment (UPC ${barcode})`,
      character: "Packaging Assortment",
      line: matchedPrefix.knownLines[0] || "Action Figure Line",
      franchise: matchedPrefix.primaryFranchises[0] || "Toys",
      manufacturer: matchedPrefix.manufacturer,
      year: 1995,
      packagingType: "Cardback Blister / Boxed",
      region: "Global",
      description: `Codi de barres assignat oficialment al fabricant de joguines ${matchedPrefix.manufacturer}. Línies associades: ${matchedPrefix.knownLines.join(', ')}.`,
      imageUrl: "/cardback_placeholder.jpeg",
      source: "gs1_registry",
      confidence: 0.85
    };
    return {
      found: true,
      isToyOrActionFigure: true,
      barcode,
      manufacturer: matchedPrefix.manufacturer,
      productName: defaultOption.title,
      notFoundReason: null,
      message: `Fabricant de figures identificat: ${matchedPrefix.manufacturer}.`,
      options: [defaultOption]
    };
  }

  // 7. Not a recognized toy barcode
  return {
    found: false,
    isToyOrActionFigure: false,
    barcode,
    manufacturer: null,
    productName: null,
    notFoundReason: "not_a_toy_manufacturer",
    message: "No s'ha trobat cap concordança amb fabricants de figures o joguines per a aquest codi de barres (Not Found).",
    options: []
  };
}
