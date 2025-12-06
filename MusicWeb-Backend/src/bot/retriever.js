// retriever.js (Gemini embeddings + cosine similarity)
// Compatible with ESM Node (uses fileURLToPath for __dirname).
// If running Node < 18, install node-fetch: `npm install node-fetch`
// It will dynamically import node-fetch only when needed.

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.warn("GEMINI_API_KEY not set — retrieval will fail without embeddings.");
}

// Proper __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, "knowledge_index.json");

// helper: safe load index
function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) return [];
  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read index:", err?.message || err);
    return [];
  }
}

// helper: ensure fetch is available (use global fetch if present, otherwise dynamic import node-fetch)
async function getFetch() {
  if (typeof globalThis.fetch === "function") return globalThis.fetch;
  try {
    // dynamic import so users only need node-fetch if they use this on Node < 18
    const nodeFetch = await import("node-fetch");
    return nodeFetch.default || nodeFetch;
  } catch (err) {
    throw new Error(
      "Fetch is not available in this environment. Install node-fetch (`npm install node-fetch`) or run on Node 18+."
    );
  }
}

// robust embedText: handles many possible response shapes, logs trimmed body when unexpected
async function embedText(text) {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

  // Use dynamic fetch helper (supports Node <18 via node-fetch)
  const fetchFn = await getFetch();

  // NOTE: This endpoint / request shape may vary with provider versions.
  // Keep the request shape robust and tolerant to different response wrappers.
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
  const body = { model: "models/gemini-embedding-001", content: { parts: [{ text }] } };

  try {
    const resp = await fetchFn(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const status = resp.status;
    const raw = await resp.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("embedText: failed parsing JSON:", err?.message || err);
      console.error("Raw response (trim):", raw.slice(0, 2000));
      throw new Error(`Invalid JSON from embedding endpoint (status ${status})`);
    }

    if (!resp.ok) {
      console.error("embedText: HTTP error", status, "body:", JSON.stringify(data).slice(0, 2000));
      throw new Error(`Embedding endpoint error ${status}`);
    }

    // Try many shapes (including common wrappers). Goal: extract an array of numbers.
    let emb = null;

    // 1) data.embedding.values (observed in some responses)
    if (!emb && data?.embedding && Array.isArray(data.embedding.values)) {
      emb = data.embedding.values;
    }

    // 2) data.embeddings -> [ { embedding: [...] } ] OR [ [...] ]
    if (!emb && Array.isArray(data?.embeddings)) {
      const f = data.embeddings[0];
      if (Array.isArray(f)) emb = f;
      else if (Array.isArray(f?.embedding)) emb = f.embedding;
      else if (Array.isArray(f?.value)) emb = f.value;
    }

    // 3) data.data -> [{ embedding: [...] }]
    if (!emb && Array.isArray(data?.data) && data.data[0]) {
      if (Array.isArray(data.data[0].embedding)) emb = data.data[0].embedding;
      else if (Array.isArray(data.data[0]?.value)) emb = data.data[0].value;
      else if (Array.isArray(data.data[0]?.embeddings)) {
        const f = data.data[0].embeddings[0];
        if (Array.isArray(f)) emb = f;
        else if (Array.isArray(f?.embedding)) emb = f.embedding;
      }
    }

    // 4) top-level arrays or fields
    if (!emb && Array.isArray(data?.embedding)) emb = data.embedding;
    if (!emb && Array.isArray(data?.value)) emb = data.value;
    if (!emb && Array.isArray(data)) {
      // If the full JSON is e.g. [[...], ...]
      if (Array.isArray(data[0])) emb = data[0];
    }

    // 5) outputs / response wrappers (some API shapes)
    if (!emb && Array.isArray(data?.outputs) && data.outputs[0]) {
      const o0 = data.outputs[0];
      if (Array.isArray(o0.embedding)) emb = o0.embedding;
      else if (Array.isArray(o0?.embeddings)) {
        const f = o0.embeddings[0];
        if (Array.isArray(f)) emb = f;
        else if (Array.isArray(f?.embedding)) emb = f.embedding;
      }
    }

    // 6) response wrappers like { response: { ... } } with nested arrays
    if (!emb && Array.isArray(data?.response) && Array.isArray(data.response[0])) emb = data.response[0];

    // Last resort: check deep for first numeric array in the object (simple scan)
    if (!emb) {
      const findFirstArray = (obj, depth = 0) => {
        if (depth > 6 || !obj || typeof obj !== "object") return null;
        if (Array.isArray(obj)) {
          if (obj.length > 0 && typeof obj[0] === "number") return obj;
          if (obj.length > 0 && Array.isArray(obj[0])) return obj[0];
        }
        for (const k of Object.keys(obj)) {
          try {
            const candidate = findFirstArray(obj[k], depth + 1);
            if (candidate) return candidate;
          } catch (e) {
            continue;
          }
        }
        return null;
      };
      emb = findFirstArray(data);
    }

    if (!emb) {
      console.error("embedText error: Unexpected embedding response shape. HTTP status:", status);
      console.error("Full response body (trimmed):", JSON.stringify(data).slice(0, 4000));
      throw new Error("Unexpected embedding response shape: " + JSON.stringify(Object.keys(data || {})));
    }

    // Normalize to plain array of numbers (some fields might be strings)
    if (!Array.isArray(emb)) {
      throw new Error("Embedding not an array");
    }
    const numeric = emb.map((v) => {
      const n = typeof v === "number" ? v : parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    });

    if (numeric.length === 0) {
      console.error("embedText: numeric embedding empty. sample raw:", (emb || []).slice(0, 10));
      throw new Error("Empty embedding");
    }

    return numeric;
  } catch (err) {
    console.error("embedText error:", err?.message || err);
    throw err;
  }
}

// cosine similarity (between two vectors)
function dot(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += (a[i] || 0) * (b[i] || 0);
  return s;
}
function norm(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] || 0) * (a[i] || 0);
  return Math.sqrt(s);
}
function cosineSim(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

/**
 * retrieve(query, topK)
 * - returns array of { id, source, chunkIndex, text, score }
 */
export async function retrieve(query, topK = 5) {
  const index = loadIndex();
  if (!index || !index.length) return [];

  let qEmb;
  try {
    qEmb = await embedText(query);
  } catch (err) {
    console.error("retrieve: failed to embed query:", err?.message || err);
    return [];
  }

  // compute similarity
  const scored = [];
  for (const item of index) {
    if (!item.embedding || !Array.isArray(item.embedding)) continue;
    try {
      const score = cosineSim(qEmb, item.embedding);
      scored.push({ ...item, score });
    } catch (err) {
      // skip items with incompatible embeddings
      continue;
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored
    .slice(0, topK)
    .map(({ id, source, chunkIndex, text, score }) => ({ id, source, chunkIndex, text, score }));
  return top;
}
