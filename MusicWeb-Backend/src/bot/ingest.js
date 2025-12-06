// ingest.js (Gemini embeddings - robust)
// Replaces OpenAI embeddings with Gemini embedContent REST call.
// Original file (for reference) uploaded by you. :contentReference[oaicite:1]{index=1}

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Tesseract from "tesseract.js";
import { fileURLToPath } from "url";

dotenv.config();

// If your Node version is < 18, uncomment the next line and install node-fetch:
// import fetch from "node-fetch";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.error("GEMINI_API_KEY missing in .env. Please set GEMINI_API_KEY.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOW_DIR = path.join(__dirname, "knowledge");
const OUT_INDEX = path.join(__dirname, "knowledge_index.json");

// helper: read all relevant files
function listKnowledgeFiles() {
  if (!fs.existsSync(KNOW_DIR)) return [];
  return fs.readdirSync(KNOW_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return [".md", ".txt", ".html", ".htm", ".png", ".jpg", ".jpeg"].includes(ext);
  });
}

// OCR function (for images)
async function ocrImage(fullPath) {
  try {
    console.log("OCR image:", fullPath);
    const res = await Tesseract.recognize(fullPath, "vie"); // Vietnamese
    return res?.data?.text || "";
  } catch (err) {
    console.warn("OCR failed for", fullPath, err?.message || err);
    return "";
  }
}

// simple chunker by paragraphs
function chunkText(text, maxChars = 1200) {
  const parts = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const out = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + "\n\n" + p).length > maxChars) {
      if (cur.trim()) out.push(cur.trim());
      cur = p;
    } else {
      cur = cur ? (cur + "\n\n" + p) : p;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// ---------- robust embedText (Gemini REST) ----------
// robust embedText — handles {"embedding":{"values":[...]}} and many other shapes
async function embedText(text) {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
  const body = { model: "models/gemini-embedding-001", content: { parts: [{ text }] } };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const status = resp.status;
    const raw = await resp.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; }
    catch (err) {
      console.error("embedText: failed parsing JSON:", err?.message || err);
      console.error("Raw response (trim):", raw.slice(0, 2000));
      throw new Error(`Invalid JSON from embedding endpoint (status ${status})`);
    }

    if (!resp.ok) {
      console.error("embedText: HTTP error", status, "body:", JSON.stringify(data).slice(0,2000));
      throw new Error(`Embedding endpoint error ${status}`);
    }

    // Try many shapes (including the one you received: data.embedding.values)
    let emb = null;

    // 1) data.embedding.values (observed in your logs)
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
    }

    // 4) top-level arrays
    if (!emb && Array.isArray(data?.embedding)) emb = data.embedding;
    if (!emb && Array.isArray(data?.value)) emb = data.value;

    // 5) outputs / response wrappers
    if (!emb && Array.isArray(data?.outputs) && data.outputs[0]) {
      const o0 = data.outputs[0];
      if (Array.isArray(o0.embedding)) emb = o0.embedding;
      else if (Array.isArray(o0?.embeddings)) {
        const f = o0.embeddings[0];
        if (Array.isArray(f)) emb = f;
        else if (Array.isArray(f?.embedding)) emb = f.embedding;
      }
    }
    if (!emb && Array.isArray(data?.response) && Array.isArray(data.response[0])) emb = data.response[0];

    // 6) fallback: whole JSON is array-of-numbers
    if (!emb && Array.isArray(data) && Array.isArray(data[0])) emb = data[0];

    if (!emb) {
      console.error("embedText error: Unexpected embedding response shape. HTTP status:", status);
      console.error("Full response body (trimmed):", JSON.stringify(data).slice(0, 4000));
      throw new Error("Unexpected embedding response shape: " + JSON.stringify(Object.keys(data || {})));
    }

    // Normalize to plain array of numbers (some fields might be strings)
    if (!Array.isArray(emb)) {
      throw new Error("Embedding not an array");
    }
    const numeric = emb.map(v => {
      // try to coerce strings like "0.123" to numbers
      const n = typeof v === "number" ? v : parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    });

    // final sanity check
    if (numeric.length === 0) {
      console.error("embedText: numeric embedding empty. sample raw:", emb.slice(0,10));
      throw new Error("Empty embedding");
    }

    return numeric;
  } catch (err) {
    console.error("embedText error:", err?.message || err);
    throw err;
  }
}


// ---------- rest unchanged ----------
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log("Starting ingest...");
  if (!fs.existsSync(KNOW_DIR)) {
    console.log("Knowledge directory not found, creating:", KNOW_DIR);
    fs.mkdirSync(KNOW_DIR, { recursive: true });
  }

  const files = listKnowledgeFiles();
  console.log("Found files:", files);

  const index = [];

  for (const fname of files) {
    const ext = path.extname(fname).toLowerCase();
    const full = path.join(KNOW_DIR, fname);

    let rawText = "";

    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      // OCR image
      rawText = await ocrImage(full);
      rawText = `--- OCR from image: ${fname} ---\n\n` + rawText;
    } else {
      try {
        rawText = fs.readFileSync(full, "utf8");
      } catch (err) {
        console.warn("Could not read file", full, err?.message || err);
        continue;
      }
    }

    // chunk text
    const chunks = chunkText(rawText, 1200);
    console.log(`File ${fname} -> ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      console.log(`Embedding ${fname} chunk ${i}...`);
      try {
        const emb = await embedText(text);
        index.push({
          id: `${fname}::${i}`,
          source: fname,
          chunkIndex: i,
          text,
          embedding: emb
        });
      } catch (err) {
        console.error("Embedding error:", err?.message || err);
      }
      // throttle a bit to avoid rate limits (increase if you see 429s)
      await sleep(250);
    }
  }

  fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 2));
  console.log("Saved index at", OUT_INDEX, "entries:", index.length);
}

run().catch(err => { console.error(err); process.exit(1); });
