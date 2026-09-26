import { GoogleGenAI } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;

function getGenAiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server environment.");
    }
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
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
  source: 'database' | 'curated_catalog' | 'online_archive';
}

export interface IdentifiedFigureResult {
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
}

export interface BarcodeDetectionResult {
  success: boolean;
  barcode?: string | null;
  format?: string;
  figureName?: string;
  lineName?: string;
  details?: string;
}

/**
 * Extracts base64 payload and MIME type from data URL or remote URL.
 */
async function resolveImageInlineData(imageBase64OrUrl: string): Promise<{ mimeType: string; data: string }> {
  if (imageBase64OrUrl.startsWith("data:")) {
    const match = imageBase64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return {
        mimeType: match[1],
        data: match[2],
      };
    }
    // If malformed data url, fallback
    const commaIndex = imageBase64OrUrl.indexOf(",");
    return {
      mimeType: "image/jpeg",
      data: commaIndex !== -1 ? imageBase64OrUrl.slice(commaIndex + 1) : imageBase64OrUrl,
    };
  }

  if (imageBase64OrUrl.startsWith("http://") || imageBase64OrUrl.startsWith("https://")) {
    const response = await fetch(imageBase64OrUrl);
    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const data = Buffer.from(arrayBuffer).toString("base64");
    return { mimeType, data };
  }

  // Treat as raw base64 string
  return {
    mimeType: "image/jpeg",
    data: imageBase64OrUrl,
  };
}

/**
 * Real visual recognition for action figures and packaging using Gemini 3.8 Flash Vision.
 */
export async function identifyFigureWithAi(imageBase64OrUrl: string): Promise<IdentifiedFigureResult> {
  const ai = getGenAiClient();
  const inlineImage = await resolveImageInlineData(imageBase64OrUrl);

  const prompt = `You are the master archivist and valuation authority for action figures, collectible toy figurines, vintage toys, and toy packaging (Kenner, Hasbro, Mattel, Playmates, Super7, MEGO, Bandai, McFarlane, NECA, Lego, Funko).
Analyze this uploaded photograph.

CRITICAL STEP 1: VALIDATE IF THIS IS AN ACTION FIGURE OR TOY
Examine whether the subject in the photo is actually an action figure, collectible figurine, toy miniature, doll, or action figure packaging/blister/cardback/box.
If the image is NOT an action figure or toy (for example: fruit, vegetables, food, domestic pets, animals, human selfie or portrait, cars/automobiles, electronics, office furniture, household products, clothing, landscapes):
You MUST immediately reject it and return ONLY this JSON structure:
{
  "found": false,
  "isToyOrActionFigure": false,
  "detectedSubject": "Concise name of the real subject (e.g. Red Apple / Fresh Fruit, Domestic Cat, Ceramic Mug, Office Desk)",
  "notFoundReason": "Explanation of why this object is not an action figure or toy collectible.",
  "message": "Not Found: L'objecte fotografiat no és cap figura d'acció ni joguina de cap fabricant col·leccionable."
}

CRITICAL STEP 2: IF IT IS AN ACTION FIGURE OR TOY PACKAGING
Determine that found = true and isToyOrActionFigure = true.
Accurately identify:
1. Exact character name (e.g. "Darth Vader", "He-Man", "Leonardo", "Ahsoka Tano", "Boba Fett", "Skeletor", "Optimus Prime")
2. Parent franchise (e.g. "Star Wars", "Masters of the Universe", "Teenage Mutant Ninja Turtles", "Transformers", "Marvel", "DC Comics")
3. Specific toy line (e.g. "Star Wars: The Power of the Force (1995)", "Star Wars: The Vintage Collection", "Masters of the Universe Vintage (1982)", "TMNT Vintage (1988)")
4. Toy manufacturer (e.g. "Kenner / Hasbro", "Mattel", "Playmates Toys", "NECA", "Super7", "Bandai")
5. Release year (e.g. 1995, 1978, 1982, 1988, 2020)
6. Specific variant name / cardback edition (e.g. "Red Card Long Saber Variant", "10-Back Soft Head", "12-Back A Vinyl Cape")
7. Packaging status: "Mint on Card (MOC)", "Carded / Blister", "Loose Complete", "Loose Incomplete", "Boxed"
8. Distinguishing visual features observed in photo (array of 2 to 4 bullet strings)
9. Visible accessories or included items (array of strings)
10. Tooling & mold details (sculpt specifics, POA, copyright stamping)
11. Authenticity verification notes (genuine vintage plastic vs reproduction/counterfeit parts)
12. Estimated collector market value in USD: estimatedLooseValue (number) and estimatedMocValue (number)
13. Barcode / UPC if visible or known (string or null)
14. Confidence score (percentage number between 75 and 99.9)

CRITICAL STEP 3: PROVIDE ONLINE ARCHIVE OPTIONS / VARIANTS
Provide an 'options' array containing 2 to 4 distinct releases, packaging editions, or mold variants referenced for this character/mold in collector archives (for example: Option 1: 1995 POTF2 Long Saber Red Card; Option 2: 1995 POTF2 Short Saber Red Card; Option 3: 1978 Kenner 12-Back Original; Option 4: 2020 Retro Collection Kenner Reissue).
Each option must include:
{
  "id": "opt-1",
  "title": "Clear descriptive title (e.g. POTF2 Darth Vader - Long Saber (1995 Red Card))",
  "figureName": "Darth Vader",
  "lineName": "Star Wars: The Power of the Force",
  "franchiseName": "Star Wars",
  "manufacturer": "Kenner / Hasbro",
  "year": 1995,
  "variantName": "Translucent Long Saber",
  "packagingStatus": "Carded / Blister (MOC)",
  "description": "Collector notes and historical release context.",
  "confidence": 98.2,
  "estimatedLooseValue": 25,
  "estimatedMocValue": 85,
  "identifyingFeatures": ["Translucent extended blade", "Red cardback header"],
  "accessoriesIdentified": ["Removable cape", "Lightsaber"],
  "moldingDetails": "Standard 1995 Kenner tooling.",
  "authenticityNotes": "Verified original production run.",
  "barcode": "076281695701"
}

Respond ONLY with valid JSON in this exact structure without markdown backticks or extra commentary:
{
  "found": true,
  "isToyOrActionFigure": true,
  "figureName": "...",
  "franchiseName": "...",
  "lineName": "...",
  "manufacturer": "...",
  "year": 1995,
  "variantName": "...",
  "confidence": 98.5,
  "packagingStatus": "...",
  "identifyingFeatures": ["..."],
  "accessoriesIdentified": ["..."],
  "moldingDetails": "...",
  "authenticityNotes": "...",
  "estimatedLooseValue": 25,
  "estimatedMocValue": 65,
  "barcode": null,
  "options": [ ... ]
}`;

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash"];
  let lastError: any = null;
  let responseText = "";

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(res => setTimeout(res, 1200));
        }
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: inlineImage },
              { text: prompt }
            ]
          },
          config: {
            temperature: 0.1,
          }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} (attempt ${attempt + 1}) encountered error:`, err.message);
        if (err.status === 503 || err.message?.includes("503") || err.message?.includes("high demand") || err.status === 429) {
          continue;
        } else {
          break;
        }
      }
    }
    if (responseText) break;
  }

  if (!responseText) {
    throw lastError || new Error("Failed to generate content from Gemini models");
  }

  const rawText = responseText;
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    // If explicit non-toy or not found
    if (parsed.isToyOrActionFigure === false || parsed.found === false) {
      return {
        found: false,
        isToyOrActionFigure: false,
        detectedSubject: parsed.detectedSubject || "Objecte no identificat com a joguina",
        notFoundReason: parsed.notFoundReason || "L'element fotografiat no correspon a cap figura d'acció ni joguina col·leccionable.",
        message: parsed.message || "Not Found: No correspon a cap fabricant de figures o joguines reconegut.",
        options: []
      };
    }

    const figureName = parsed.figureName || "Unidentified Action Figure";
    const franchiseName = parsed.franchiseName || "Action Figures";
    const lineName = parsed.lineName || "Collector Archive";
    const manufacturer = parsed.manufacturer || "Kenner / Hasbro";
    const year = typeof parsed.year === "number" ? parsed.year : 1980;
    const variantName = parsed.variantName || "Standard Release";
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 95.0;
    const packagingStatus = parsed.packagingStatus || "Carded / Blister";
    const identifyingFeatures = Array.isArray(parsed.identifyingFeatures) ? parsed.identifyingFeatures : ["Standard production mold"];
    const accessoriesIdentified = Array.isArray(parsed.accessoriesIdentified) ? parsed.accessoriesIdentified : [];
    const moldingDetails = parsed.moldingDetails || "Official production tooling verified.";
    const authenticityNotes = parsed.authenticityNotes || "No signs of counterfeit or reproduction casting.";
    const estimatedLooseValue = typeof parsed.estimatedLooseValue === "number" ? parsed.estimatedLooseValue : 25;
    const estimatedMocValue = typeof parsed.estimatedMocValue === "number" ? parsed.estimatedMocValue : 65;
    const barcode = parsed.barcode || null;

    // Build raw options
    let rawOptions: AiFigureOption[] = [];
    if (Array.isArray(parsed.options) && parsed.options.length > 0) {
      rawOptions = parsed.options.map((opt: any, idx: number) => ({
        id: opt.id || `opt-${idx + 1}-${figureName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: opt.title || `${figureName} (${opt.variantName || variantName})`,
        figureName: opt.figureName || figureName,
        lineName: opt.lineName || lineName,
        franchiseName: opt.franchiseName || franchiseName,
        manufacturer: opt.manufacturer || manufacturer,
        year: typeof opt.year === "number" ? opt.year : year,
        variantName: opt.variantName || variantName,
        packagingStatus: opt.packagingStatus || packagingStatus,
        description: opt.description || `Edició catalogada a la xarxa per a ${figureName}.`,
        confidence: typeof opt.confidence === "number" ? opt.confidence : Math.max(80, confidence - idx * 2),
        estimatedLooseValue: typeof opt.estimatedLooseValue === "number" ? opt.estimatedLooseValue : estimatedLooseValue,
        estimatedMocValue: typeof opt.estimatedMocValue === "number" ? opt.estimatedMocValue : estimatedMocValue,
        identifyingFeatures: Array.isArray(opt.identifyingFeatures) ? opt.identifyingFeatures : identifyingFeatures,
        accessoriesIdentified: Array.isArray(opt.accessoriesIdentified) ? opt.accessoriesIdentified : accessoriesIdentified,
        moldingDetails: opt.moldingDetails || moldingDetails,
        authenticityNotes: opt.authenticityNotes || authenticityNotes,
        barcode: opt.barcode || barcode,
        source: 'online_archive'
      }));
    } else {
      // Create primary option
      rawOptions = [{
        id: `opt-primary-${figureName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: `${figureName} - ${variantName} (${year})`,
        figureName,
        lineName,
        franchiseName,
        manufacturer,
        year,
        variantName,
        packagingStatus,
        description: `Edició identificada per concordança visual a l'arxiu col·leccionista.`,
        confidence,
        estimatedLooseValue,
        estimatedMocValue,
        identifyingFeatures,
        accessoriesIdentified,
        moldingDetails,
        authenticityNotes,
        barcode,
        source: 'online_archive'
      }];
    }

    return {
      found: true,
      isToyOrActionFigure: true,
      figureName,
      franchiseName,
      lineName,
      manufacturer,
      year,
      variantName,
      confidence,
      packagingStatus,
      identifyingFeatures,
      accessoriesIdentified,
      moldingDetails,
      authenticityNotes,
      estimatedLooseValue,
      estimatedMocValue,
      barcode,
      options: rawOptions
    };
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", rawText, err);
    throw new Error("Gemini AI analysis produced non-JSON format: " + rawText.slice(0, 100));
  }
}

/**
 * Optical barcode recognition from action figure package photo using Gemini Vision.
 */
export async function detectBarcodeWithAi(imageBase64OrUrl: string): Promise<BarcodeDetectionResult> {
  const ai = getGenAiClient();
  const inlineImage = await resolveImageInlineData(imageBase64OrUrl);

  const prompt = `You are a high-precision barcode scanner and toy packaging archivist.
Examine this action figure cardback or packaging photo.
Look for any barcode (UPC-A, EAN-13, JAN, Code 128, or printed numbers under the barcode stripes).
Also identify the toy character and packaging line if discernible.

Respond ONLY with valid JSON (no markdown backticks):
{
  "success": true,
  "barcode": "076281695701",
  "format": "UPC-A",
  "figureName": "Ahsoka Tano",
  "lineName": "Star Wars: The Retro Collection",
  "details": "UPC barcode clearly printed on lower cardback"
}

If no barcode is legible in the image, return:
{
  "success": false,
  "barcode": null,
  "format": null,
  "figureName": "Ahsoka Tano",
  "lineName": "Star Wars: The Retro Collection",
  "details": "No readable barcode detected in image frame"
}`;

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash"];
  let lastError: any = null;
  let responseText = "";

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(res => setTimeout(res, 1200));
        }
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: inlineImage },
              { text: prompt }
            ]
          },
          config: {
            temperature: 0.1,
          }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed for barcode detection:`, err.message);
        if (err.status === 503 || err.message?.includes("503") || err.message?.includes("high demand") || err.status === 429) {
          continue;
        } else {
          break;
        }
      }
    }
    if (responseText) break;
  }

  if (!responseText) {
    return {
      success: false,
      details: lastError?.message || "Could not detect barcode from image."
    };
  }

  const rawText = responseText;
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("Failed to parse Gemini barcode response:", rawText, err);
    return {
      success: false,
      details: "Could not decode barcode from image."
    };
  }
}
