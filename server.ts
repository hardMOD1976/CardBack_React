import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "crypto";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./server/swaggerSpec";
import { identifyFigureWithAi, detectBarcodeWithAi } from "./server/geminiAiService";
import { getCatalogEntity, getAllCatalog } from "./server/catalogService";
import { lookupBarcodeOnline } from "./server/barcodeLookupService";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET: string = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? randomBytes(48).toString("hex") : "");
if (process.env.NODE_ENV === "production" && (!JWT_SECRET || JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!JWT_SECRET) return res.status(503).json({ error: "Authentication is not configured." });
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const cookieToken = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("cb_session="))
    ?.slice("cb_session=".length);
  let decoded: { id: string; role?: string; kind?: string } | null = null;
  let decodedCookie = "";
  try { decodedCookie = cookieToken ? decodeURIComponent(cookieToken) : ""; } catch { decodedCookie = ""; }
  const tokens = [bearerToken, decodedCookie].filter(Boolean);
  for (const token of tokens) {
    try {
      const candidate = jwt.verify(token, JWT_SECRET) as { id: string; role?: string; kind?: string };
      if (candidate?.id && candidate.kind !== "preauth") { decoded = candidate; break; }
    } catch { /* Try the session cookie if a legacy bearer token is expired. */ }
  }
  if (!decoded) return res.status(401).json({ error: tokens.length ? "Invalid or expired token." : "Authentication required." });
  res.locals.user = decoded;
  next();
}

const SESSION_COOKIE = "cb_session";
const SESSION_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: express.Response, user: any, rememberMe: boolean) {
  const maxAge = rememberMe ? SESSION_REMEMBER_MS : undefined;
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role || "USER", kind: "session" },
    JWT_SECRET,
    { expiresIn: rememberMe ? "30d" : "8h" }
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  });
}

function clearSessionCookie(res: express.Response) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function normalizePublicUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    role: user.role || "USER",
  };
}

function makePreAuthTicket(user: any) {
  return jwt.sign({ id: user.id, kind: "preauth" }, JWT_SECRET, { expiresIn: "10m" });
}

const passwordResetTableSql = `
  CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "usedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken" ("userId");
`;

let passwordResetTableReady: Promise<void> | null = null;
async function ensurePasswordResetTable(pool: pg.Pool) {
  if (!passwordResetTableReady) {
    passwordResetTableReady = pool.query(passwordResetTableSql).then(() => undefined).catch((error) => {
      passwordResetTableReady = null;
      throw error;
    });
  }
  await passwordResetTableReady;
}

function emailRecoveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && (process.env.APP_BASE_URL || process.env.NODE_ENV !== "production"));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] || char));
}

async function sendPasswordResetEmail(to: string, displayName: string, resetUrl: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject: "Reset your Cardback password",
      html: `<p>Hello ${escapeHtml(displayName || "collector")},</p><p>Use the link below to choose a new Cardback password. This link expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  requireAuth(req, res, () => {
    if (String(res.locals.user?.role || "").toUpperCase() !== "ADMIN") return res.status(403).json({ error: "Administrator access required." });
    next();
  });
}

// Database connection pool (lazy or direct with SSL)
let dbPool: pg.Pool | null = null;

function getDbPool(): pg.Pool | null {
  if (dbPool) return dbPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  try {
    dbPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    return dbPool;
  } catch (err) {
    console.error("Failed to initialize Neon Postgres pool:", err);
    return null;
  }
}

// ----------------- API ENDPOINTS -----------------

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/spec", (req, res) => res.json(swaggerSpec));
app.get("/api", (req, res, next) => {
  if (req.accepts("html") && !req.xhr) {
    return res.redirect("/api-docs/");
  }
  next();
});

// ----------------- AUTHENTICATION ENDPOINTS -----------------

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured. Add DATABASE_URL to the local .env file to enable account login." });
  }
  const { usernameOrEmail, username, email, password } = req.body;
  const identifier = (usernameOrEmail || username || email || "").trim();

  if (!identifier || !password) {
    return res.status(400).json({ error: "Username or email and password are required." });
  }

  try {
    let userRow: any = null;

    if (pool) {
      const query = `
        SELECT id, username, email, "displayName", role, "passwordHash"
        FROM "User"
        WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
        LIMIT 1;
      `;
      const result = await pool.query(query, [identifier]);
      if (result.rows.length > 0) {
        userRow = result.rows[0];
      }
    }

    if (userRow) {
      let isMatch = false;
      if (userRow.passwordHash) {
        try {
          isMatch = bcrypt.compareSync(password, userRow.passwordHash);
        } catch (e) {
          isMatch = false;
        }
      }
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      pool.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [userRow.id]).catch(() => {});
      return res.json({ authTicket: makePreAuthTicket(userRow), user: normalizePublicUser(userRow) });
    }

    return res.status(401).json({ error: "Invalid username or password." });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/config", (_req, res) => res.json({ passwordRecoveryEnabled: emailRecoveryConfigured() }));

app.post("/api/auth/register", async (req, res) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const username = String(req.body?.username || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const displayName = String(req.body?.displayName || username).trim();
  const password = String(req.body?.password || "");
  if (!/^[A-Za-z0-9._-]{3,24}$/.test(username)) return res.status(400).json({ error: "Username must be 3–24 characters using letters, numbers, dots, underscores or hyphens." });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (displayName.length < 1 || displayName.length > 80) return res.status(400).json({ error: "Display name must be 1–80 characters." });
  if (password.length < 12 || password.length > 128) return res.status(400).json({ error: "Password must be between 12 and 128 characters." });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(`INSERT INTO "User" (id, username, email, "displayName", role, "passwordHash", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, 'USER', $5, NOW(), NOW()) RETURNING id, username, email, "displayName", role`,
      [randomUUID(), username, email, displayName, passwordHash]);
    const user = result.rows[0];
    return res.status(201).json({ authTicket: makePreAuthTicket(user), user: normalizePublicUser(user) });
  } catch (error: any) {
    if (error?.code === "23505") return res.status(409).json({ error: "That username or email is already registered." });
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Could not create the account." });
  }
});

app.post("/api/auth/session", async (req, res) => {
  const ticket = String(req.body?.authTicket || "");
  try {
    const decoded = jwt.verify(ticket, JWT_SECRET) as any;
    if (decoded.kind !== "preauth" || !decoded.id) return res.status(401).json({ error: "Invalid sign-in ticket." });
    const pool = getDbPool();
    if (!pool) return res.status(503).json({ error: "Database not configured." });
    const result = await pool.query('SELECT id, username, email, "displayName", role FROM "User" WHERE id = $1', [decoded.id]);
    if (!result.rows.length) return res.status(401).json({ error: "Account no longer exists." });
    setSessionCookie(res, result.rows[0], req.body?.rememberMe === true);
    return res.json({ user: normalizePublicUser(result.rows[0]) });
  } catch {
    return res.status(401).json({ error: "Sign-in expired. Please sign in again." });
  }
});

app.post("/api/auth/password/forgot", async (req, res) => {
  if (!emailRecoveryConfigured()) return res.status(503).json({ error: "Password recovery email is not configured yet." });
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || email.length > 254) return res.status(400).json({ error: "Enter a valid email address." });
  try {
    const result = await pool.query('SELECT id, email, "displayName", username FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
    if (result.rows.length) {
      await ensurePasswordResetTable(pool);
      const user = result.rows[0];
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      await pool.query('DELETE FROM "PasswordResetToken" WHERE "userId" = $1 OR "expiresAt" < NOW()', [user.id]);
      await pool.query('INSERT INTO "PasswordResetToken" (id, "userId", "tokenHash", "expiresAt") VALUES ($1, $2, $3, NOW() + INTERVAL \'30 minutes\')', [randomUUID(), user.id, tokenHash]);
      const baseUrl = (process.env.APP_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
      try { await sendPasswordResetEmail(user.email, user.displayName || user.username, `${baseUrl}/?reset=${rawToken}`); }
      catch (error) { console.error("Password recovery email delivery failed."); }
    }
    return res.json({ message: "If an account exists for that email, a password reset link will be sent shortly." });
  } catch (error) {
    console.error("Password recovery request failed.");
    return res.status(500).json({ error: "Could not process the recovery request." });
  }
});

app.post("/api/auth/password/reset", async (req, res) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ error: "This reset link is invalid or expired." });
  if (password.length < 12 || password.length > 128) return res.status(400).json({ error: "Password must be between 12 and 128 characters." });
  const client = await pool.connect();
  try {
    await ensurePasswordResetTable(pool);
    await client.query("BEGIN");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const found = await client.query('UPDATE "PasswordResetToken" SET "usedAt" = NOW() WHERE "tokenHash" = $1 AND "usedAt" IS NULL AND "expiresAt" > NOW() RETURNING "userId"', [tokenHash]);
    if (!found.rows.length) { await client.query("ROLLBACK"); return res.status(400).json({ error: "This reset link is invalid or expired." }); }
    const passwordHash = await bcrypt.hash(password, 12);
    await client.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [passwordHash, found.rows[0].userId]);
    await client.query('DELETE FROM "PasswordResetToken" WHERE "userId" = $1', [found.rows[0].userId]);
    await client.query("COMMIT");
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Password reset failed:", error);
    return res.status(500).json({ error: "Could not reset the password." });
  } finally { client.release(); }
});

app.post("/api/auth/password/change", requireAuth, async (req, res) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ error: "Database not configured." });
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (newPassword.length < 12 || newPassword.length > 128) return res.status(400).json({ error: "Password must be between 12 and 128 characters." });
  try {
    const result = await pool.query('SELECT "passwordHash" FROM "User" WHERE id = $1', [res.locals.user.id]);
    if (!result.rows.length || !await bcrypt.compare(currentPassword, result.rows[0].passwordHash || "")) return res.status(401).json({ error: "Current password is incorrect." });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2', [hash, res.locals.user.id]);
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: "Could not change the password." }); }
});

// GET /api/auth/me
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const decoded = res.locals.user;
    const pool = getDbPool();
    if (pool && decoded.id) {
      const uRes = await pool.query('SELECT id, username, email, "displayName", role FROM "User" WHERE id = $1', [decoded.id]);
      if (uRes.rows.length > 0) {
        return res.json({ user: uRes.rows[0] });
      }
    }
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true, message: "Collector signed out successfully" });
});

// Health check and DB status
app.get("/api/health", async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({ status: "ok", database: "disconnected (no DATABASE_URL)" });
  }
  try {
    const testResult = await pool.query("SELECT NOW() as now, current_database() as db_name");
    return res.json({
      status: "ok",
      database: "connected",
      dbName: testResult.rows[0]?.db_name,
      serverTime: testResult.rows[0]?.now
    });
  } catch (err: any) {
    return res.json({ status: "warning", database: "error", error: err.message });
  }
});

// Collection - Get all owned items
app.get("/api/collection", requireAuth, async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    const query = `
      SELECT o.id, o."userId", o."productReleaseId", o.condition, o.completeness, o."packagingState",
             o."purchaseDate", o."purchasePrice", o.currency, o."estimatedMarketValue",
             o."storageLocation", o.notes, o.quantity, o."createdAt",
             pr.name as "releaseName", pr."packagingType",
             v.name as "variantName",
             f.id as "figureId", f.name as "figureName", f.code as "figureCode", f."imageUrl" as "figureImageUrl",
             l.id as "lineId", l.name as "lineName",
             fr.id as "franchiseId", fr.name as "franchiseName"
      FROM "OwnedFigure" o
      LEFT JOIN "ProductRelease" pr ON o."productReleaseId" = pr.id
      LEFT JOIN "Variant" v ON pr."variantId" = v.id
      LEFT JOIN "Figure" f ON v."figureId" = f.id
      LEFT JOIN "Line" l ON f."lineId" = l.id
      LEFT JOIN "Franchise" fr ON l."franchiseId" = fr.id
       WHERE o."deletedAt" IS NULL AND o."userId" = $1
      ORDER BY o."createdAt" DESC;
    `;
    const result = await pool.query(query, [res.locals.user.id]);

    // Map to domain OwnedFigure contract
    const items = result.rows.map((row: any) => {
      // Normalizing condition to FigureCondition
      let condition: string = "MOC";
      const c = (row.condition || "").toUpperCase();
      if (c.includes("MINT") || c.includes("MOC")) condition = "MOC";
      else if (c.includes("GRADED")) condition = "GRADED";
      else if (row.completeness === "Incomplete") condition = "LOOSE_INCOMPLETE";
      else condition = "LOOSE_COMPLETE";

      return {
        id: row.id,
        userId: row.userId,
        figureId: row.figureId || row.id,
        figureName: row.figureName || row.releaseName || "Custom Figure",
        figureCode: row.figureCode || undefined,
        figureImageUrl: row.figureImageUrl || "/cardback_placeholder.jpeg",
        lineId: row.lineId || "line-default",
        lineName: row.lineName || "Vintage Collection",
        franchiseId: row.franchiseId || "franchise-default",
        franchiseName: row.franchiseName || "Star Wars",
        variantName: row.variantName || undefined,
        productReleaseId: row.productReleaseId,
        releasePackaging: row.packagingType || row.packagingState,
        condition,
        purchasePrice: parseFloat(row.purchasePrice) || 0,
        currency: row.currency || "EUR",
        estimatedValue: parseFloat(row.estimatedMarketValue) || parseFloat(row.purchasePrice) || 0,
        acquisitionDate: row.purchaseDate ? new Date(row.purchaseDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        quantity: row.quantity || 1,
        storageLocation: row.storageLocation || "Display Shelf",
        collectorNotes: row.notes || "",
        isWishlist: false,
        addedAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString()
      };
    });

    res.json({ items });
  } catch (err: any) {
    console.error("Error fetching collection from Neon:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add figure to Neon collection
app.post("/api/collection", requireAuth, async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    const body = req.body;
    const userId = res.locals.user.id;

    // Check if we have a product release id or fallback
    let productReleaseId = body.productReleaseId;
    if (!productReleaseId) {
      const prRes = await pool.query('SELECT id FROM "ProductRelease" LIMIT 1');
      productReleaseId = prRes.rows[0]?.id;
    }

    const insertQuery = `
      INSERT INTO "OwnedFigure" (
        "id", "userId", "productReleaseId", "condition", "completeness",
        "packagingState", "purchaseDate", "purchasePrice", "currency",
        "purchaseLocation", "estimatedMarketValue", "storageLocation", "notes",
        "quantity", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      ) RETURNING *;
    `;

    const newId = typeof body.id === "string" && body.id.length <= 100
      ? body.id
      : `own_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cond = body.condition === "MOC" ? "Mint" : body.condition === "GRADED" ? "Graded" : "Used";
    const comp = body.condition === "LOOSE_INCOMPLETE" ? "Incomplete" : "Complete";
    const pkgState = body.condition === "MOC" ? "Sealed" : "Opened";

    const values = [
      newId,
      userId,
      productReleaseId,
      cond,
      comp,
      pkgState,
      body.acquisitionDate ? new Date(body.acquisitionDate) : new Date(),
      body.purchasePrice || 0,
      body.currency || "EUR",
      body.storageLocation || "Personal Collection",
      body.estimatedValue || body.purchasePrice || 0,
      body.storageLocation || "Display Shelf",
      body.collectorNotes || "",
      body.quantity || 1
    ];

    const inserted = await pool.query(insertQuery, values);
    res.status(201).json({ item: inserted.rows[0] });
  } catch (err: any) {
    console.error("Error adding figure to Neon:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete figure
app.put("/api/collection/:id", requireAuth, async (req, res) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ error: "Database not configured" });
  const body = req.body || {};
  const price = Number(body.purchasePrice);
  const value = Number(body.estimatedValue);
  const quantity = Number(body.quantity);
  const acquisitionDate = body.acquisitionDate ? new Date(body.acquisitionDate) : null;
  if ((body.purchasePrice !== undefined && (!Number.isFinite(price) || price < 0)) ||
      (body.estimatedValue !== undefined && (!Number.isFinite(value) || value < 0)) ||
      (body.quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1)) ||
      (acquisitionDate && Number.isNaN(acquisitionDate.getTime()))) {
    return res.status(400).json({ error: "Invalid collection values." });
  }
  try {
    const condition = body.condition === "MOC" ? "Mint" : body.condition === "GRADED" ? "Graded" : body.condition ? "Used" : null;
    const completeness = body.condition === "LOOSE_INCOMPLETE" ? "Incomplete" : body.condition ? "Complete" : null;
    const packagingState = body.condition ? (body.condition === "MOC" ? "Sealed" : "Opened") : null;
    const result = await pool.query(`
      UPDATE "OwnedFigure" SET
        "condition" = COALESCE($1, "condition"),
        "completeness" = COALESCE($2, "completeness"),
        "packagingState" = COALESCE($3, "packagingState"),
        "purchaseDate" = COALESCE($4, "purchaseDate"),
        "purchasePrice" = COALESCE($5, "purchasePrice"),
        currency = COALESCE($6, currency),
        "estimatedMarketValue" = COALESCE($7, "estimatedMarketValue"),
        "storageLocation" = COALESCE($8, "storageLocation"),
        notes = COALESCE($9, notes),
        quantity = COALESCE($10, quantity),
        "updatedAt" = NOW()
      WHERE id = $11 AND "userId" = $12 AND "deletedAt" IS NULL
      RETURNING id;
    `, [
      condition, completeness, packagingState, acquisitionDate,
      body.purchasePrice === undefined ? null : price,
      body.currency || null,
      body.estimatedValue === undefined ? null : value,
      body.storageLocation || null,
      body.collectorNotes === undefined ? null : String(body.collectorNotes),
      body.quantity === undefined ? null : quantity,
      req.params.id, res.locals.user.id
    ]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Collection item not found." });
    return res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    console.error("Error updating collection item:", err);
    return res.status(500).json({ error: "Could not update collection item." });
  }
});

app.delete("/api/collection/:id", requireAuth, async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE "OwnedFigure" SET "deletedAt" = NOW() WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL', [id, res.locals.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Collection item not found." });
    res.json({ success: true, id });
  } catch (err: any) {
    console.error("Error deleting figure in Neon:", err);
    res.status(500).json({ error: err.message });
  }
});

// Database Catalogue Metadata summary
app.get("/api/db/stats", async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    const tables = ["Manufacturer", "Line", "Franchise", "Character", "Figure", "Variant", "ProductRelease", "OwnedFigure"];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const r = await pool.query(`SELECT count(*) FROM "${t}" WHERE "deletedAt" IS NULL OR "deletedAt" IS NOT NULL`);
      counts[t] = parseInt(r.rows[0].count, 10);
    }
    res.json({ counts, host: "Neon PostgreSQL (AWS eu-central-1)" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Star Wars Historical Catalogue into Neon DB
app.post("/api/db/seed/star-wars", requireAdmin, async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: "Database connection not configured in .env (DATABASE_URL missing)" });
  }
  try {
    const { seedStarWarsCatalogue } = await import("./server/seedDatabase");
    const result = await seedStarWarsCatalogue(pool);
    res.json({
      success: true,
      message: "Star Wars archive successfully seeded into Neon PostgreSQL!",
      ...result
    });
  } catch (err: any) {
    console.error("Error seeding Star Wars database:", err);
    res.status(500).json({ error: err.message });
  }
});

// Community Catalog Proposal Endpoint (Wikipedia / Discogs style contribution)
app.post("/api/catalog/propose", requireAuth, async (req, res) => {
  const pool = getDbPool();
  const { 
    name, 
    characterName, 
    lineId, 
    lineName, 
    year, 
    condition, 
    conditionDetails, 
    barcode, 
    description, 
    imageUrl, 
    userNotes 
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Figure name is required for catalog proposal." });
  }

  const generatedId = `fig-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const resolvedImage = imageUrl || "/cardback_placeholder.jpeg";
  const releaseYear = parseInt(year, 10) || new Date().getFullYear();

  try {
    if (pool) {
      // 1. Ensure Character exists or create one (finding current Star Wars franchiseId dynamically)
      let resolvedFranchiseId = 'fran-star-wars';
      const frRes = await pool.query(`SELECT id FROM "Franchise" WHERE name ILIKE '%star wars%' LIMIT 1`);
      if (frRes.rows.length > 0) {
        resolvedFranchiseId = frRes.rows[0].id;
      }

      let charId = `char-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;
      if (characterName) {
        charId = `char-${characterName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;
        await pool.query(`
          INSERT INTO "Character" (id, name, "franchiseId", description, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING;
        `, [charId, characterName, resolvedFranchiseId, `Community catalogued character ${characterName}.`]);
      }

      // 2. Format condition string and description
      const conditionTag = condition ? `Estat: ${condition}${conditionDetails ? ` (${conditionDetails})` : ''}` : '';
      const combinedDescription = [
        description,
        conditionTag ? `[${conditionTag}]` : '',
        userNotes
      ].filter(Boolean).join(' | ') || `Community catalogued figure submitted by collector.`;

      // 3. Insert Figure
      const resolvedLine = lineId || 'line-sw-tvc';
      await pool.query(`
        INSERT INTO "Figure" (id, name, code, "lineId", "characterId", description, "imageUrl", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          "imageUrl" = EXCLUDED."imageUrl",
          "updatedAt" = NOW();
      `, [
        generatedId,
        name.trim(),
        barcode ? `BC-${barcode.slice(-6)}` : `COMM-${Date.now().toString().slice(-4)}`,
        resolvedLine,
        characterName ? charId : null,
        combinedDescription,
        resolvedImage
      ]);

      // 4. Insert Variant & Product Release with condition awareness
      const varId = `var-${generatedId}-std`;
      const varDesc = [
        conditionTag || "Collector submitted variant entry",
        userNotes
      ].filter(Boolean).join(' - ');

      await pool.query(`
        INSERT INTO "Variant" (id, "figureId", name, description, "imageUrl", "createdAt", "updatedAt")
        VALUES ($1, $2, 'Standard Community Entry', $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [varId, generatedId, varDesc, resolvedImage]);

      // Resolve packaging type according to figure condition
      let packagingType = 'Blister Card';
      if (condition === 'MOC') packagingType = 'Blister Card (Mint on Card)';
      else if (condition === 'MIB') packagingType = 'Sealed Box (MISB / MIB)';
      else if (condition === 'CARDED_DAMAGED') packagingType = 'Blister Card (Wear / Damaged)';
      else if (condition === 'LOOSE_COMPLETE') packagingType = 'Loose (Complete with all accessories)';
      else if (condition === 'LOOSE_INCOMPLETE') packagingType = 'Loose (Incomplete)';
      else if (condition === 'LOOSE_PLAYED') packagingType = 'Loose (Played / Wear)';
      else if (condition === 'GRADED') packagingType = `Graded Protective Case${conditionDetails ? ` (${conditionDetails})` : ''}`;
      else if (condition === 'CUSTOM') packagingType = 'Custom / Repaint';
      else if (condition === 'OTHER' && conditionDetails) packagingType = conditionDetails;

      const relId = `rel-${generatedId}-orig`;
      await pool.query(`
        INSERT INTO "ProductRelease" (id, "variantId", name, "packagingType", barcode, "releaseDate", region, "imageUrl", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, 'Community Contributed', $7, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [
        relId,
        varId,
        `${name.trim()} (${packagingType})`,
        packagingType,
        barcode || null,
        new Date(`${releaseYear}-01-01`),
        resolvedImage
      ]);
    }

    res.status(201).json({
      success: true,
      message: "Proposta de figura afegida correctament al catàleg!",
      figure: {
        id: generatedId,
        name: name.trim(),
        year: releaseYear,
        lineId: lineId || 'line-sw-tvc',
        condition: condition || 'MOC',
        conditionDetails: conditionDetails || undefined,
        imageUrl: resolvedImage,
        barcode: barcode || undefined
      }
    });
  } catch (err: any) {
    console.error("Error creating figure proposal:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------- ARCHIVE CATALOGUE ENDPOINTS -----------------

// GET /api/catalog/all - Unified archive catalog (PostgreSQL + Curated Seeds)
app.get("/api/catalog/all", async (req, res) => {
  try {
    const pool = getDbPool();
    const catalog = await getAllCatalog(pool);
    res.json(catalog);
  } catch (err: any) {
    console.error("Error fetching all catalog:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/catalog/:type/:id - Fetch any entity detail by type and ID
app.get("/api/catalog/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const pool = getDbPool();
    const entity = await getCatalogEntity(type, id, pool);
    if (!entity) {
      return res.status(404).json({ error: `Catalogue entity of type '${type}' with ID '${id}' not found.` });
    }
    res.json(entity);
  } catch (err: any) {
    console.error(`Error fetching catalog entity ${req.params.type}/${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/figures/:id - Direct alias for figure detail
app.get("/api/figures/:id", async (req, res) => {
  try {
    const pool = getDbPool();
    const entity = await getCatalogEntity("figure", req.params.id, pool);
    if (!entity) {
      return res.status(404).json({ error: `Figure with ID '${req.params.id}' not found.` });
    }
    res.json(entity);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/figures - List all figures
app.get("/api/figures", async (req, res) => {
  try {
    const pool = getDbPool();
    const catalog = await getAllCatalog(pool);
    res.json({ figures: catalog.figures, total: catalog.figures.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- GEMINI AI MULTIMODAL VISION ENDPOINTS -----------------

// POST /api/ai/identify-figure
app.post("/api/ai/identify-figure", requireAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "Missing 'image' parameter in request body." });
    }
    const result = await identifyFigureWithAi(image);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Error identifying figure with Gemini AI:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to identify figure with Gemini AI"
    });
  }
});

// POST /api/scanner/detect-barcode
app.post("/api/scanner/detect-barcode", requireAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "Missing 'image' parameter in request body." });
    }
    const result = await detectBarcodeWithAi(image);
    return res.json(result);
  } catch (err: any) {
    console.error("Error detecting barcode with Gemini AI:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to detect barcode with Gemini AI"
    });
  }
});

// POST /api/scanner/lookup-barcode-online - Live Internet and Database Barcode Validation
app.post("/api/scanner/lookup-barcode-online", requireAuth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ success: false, error: "Missing 'barcode' parameter in request body." });
    }
    const pool = getDbPool();
    const result = await lookupBarcodeOnline(barcode, pool);
    return res.json(result);
  } catch (err: any) {
    console.error("Error performing online barcode lookup:", err);
    return res.status(500).json({
      found: false,
      isToyOrActionFigure: false,
      barcode: req.body?.barcode || "",
      manufacturer: null,
      productName: null,
      notFoundReason: "unregistered_barcode",
      message: err.message || "Error durant la cerca en línia del codi de barres.",
      options: []
    });
  }
});

// ----------------- VITE MIDDLEWARE SETUP -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cardback server running on port ${PORT} with Neon PostgreSQL support`);
  });
}

startServer();
