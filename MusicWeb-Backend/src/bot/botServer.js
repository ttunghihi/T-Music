// botServer.js — Gemini Version (robust init + RAG + graceful fallback)
// ESM (node >= 14+). If running Node < 18, install `node-fetch` for fetch support:
// npm install node-fetch

import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { retrieve } from "./retriever.js"; // retriever should be in same folder

// ESM dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from this file's directory
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('Loaded .env from:', path.join(__dirname, '.env'));
console.log('GEMINI_API_KEY set?', !!process.env.GEMINI_API_KEY);

// ---------- CONFIG ----------
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.BOT_PORT || 5002;
// If you want an opt-in to show sources (for debugging), set SHOW_SOURCES=true in env
const SHOW_SOURCES = String(process.env.SHOW_SOURCES || "").toLowerCase() === "true";

// Init app
const app = express();
app.use(express.json());

// CORS
const ALLOWED_ORIGINS = [
  "https://t-music.onrender.com",
  "https://t-music-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiter
const botLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});
app.use("/api/bot", botLimiter);

// ---------- INTENTS (still loadable for admin but NOT required in main flow) ----------
const INTENTS_PATH = path.join(__dirname, "intents.json");
let INTENTS = [];

function loadIntents() {
  try {
    const raw = fs.readFileSync(INTENTS_PATH, "utf8");
    INTENTS = JSON.parse(raw);
    console.log("Loaded intents:", INTENTS.length);
  } catch (err) {
    console.warn("Load intents failed:", err?.message || err);
    INTENTS = [];
  }
}
loadIntents();

app.post("/api/bot/reload-intents", (req, res) => {
  loadIntents();
  res.json({ success: true, count: INTENTS.length });
});

app.get("/api/bot/health", (req, res) => {
  res.json({ success: true, status: "ok", intents: INTENTS.length });
});

// ---------- fetch helper (supports Node <18 via dynamic node-fetch) ----------
async function getFetch() {
  if (typeof globalThis.fetch === "function") return globalThis.fetch;
  try {
    const mod = await import("node-fetch");
    return mod.default || mod;
  } catch (err) {
    throw new Error(
      "Fetch is not available. Install node-fetch (`npm install node-fetch`) or run on Node 18+."
    );
  }
}

// ---------- GEMINI CLIENT (improved detection + smoke test + graceful fallback) ----------
let gemini = null;
let GEMINI_MODEL = null;
let embeddingOnlyKey = false;

const preferredCandidates = [
  "gemini-3-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
];

async function chooseModelFromList(apiKey) {
  try {
    const fetchFn = await getFetch();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const r = await fetchFn(url, { method: "GET" });
    if (!r.ok) {
      return { status: "error", code: r.status };
    }
    const data = await r.json();
    const modelsRaw = Array.isArray(data.models) ? data.models : [];

    // Normalize model objects
    const models = modelsRaw.map(m => {
      if (!m) return null;
      if (typeof m === "string") return { name: m, supportedMethods: null, displayName: "" , raw: m };
      return { name: m.name || m.id || "", supportedMethods: m.supportedMethods || m.capabilities || null, displayName: m.displayName || "", raw: m };
    }).filter(Boolean);

    // If all model names look like embedding-only -> report embedding_only
    const names = models.map(m => m.name);
    const allEmbedding = names.length > 0 && names.every(n => /embedding[-_]/i.test(n) || /gecko/i.test(n));
    if (allEmbedding) return { status: "embedding_only", models: names };

    // Prefer models that explicitly list generateContent/chat
    for (const m of models) {
      const methods = m.supportedMethods;
      if (methods) {
        const s = typeof methods === "string" ? methods : JSON.stringify(methods);
        if (/generateContent|chat|generate/i.test(s)) return { status: "ok", model: m.name };
      }
    }

    // Try to match preferredCandidates inside names
    for (const cand of preferredCandidates) {
      const found = models.find(m => m.name.includes(cand) || m.name.endsWith(`/${cand}`) || m.name === cand);
      if (found) return { status: "ok", model: found.name };
    }

    // Heuristic fallback: find any name that looks generative
    const heur = models.find(m => /gemini|chat|generate|language/i.test(m.name + " " + m.displayName));
    if (heur) return { status: "ok", model: heur.name };

    // nothing clearly generative
    return { status: "no_gen_model", models: names };
  } catch (err) {
    console.warn("chooseModelFromList error:", err?.message || err);
    return { status: "error", error: err?.message || String(err) };
  }
}

// --- Robust initGemini and helpers ---
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function trySmokeTestModel(genAI, modelName) {
  try {
    const modelWrapper = genAI.getGenerativeModel({ model: modelName });
    const testPrompt = `Bạn là hệ thống kiểm tra khả năng trả lời. Trả lời: OK`;
    const r = await modelWrapper.generateContent(testPrompt);
    const t = await r.response;
    const txt = (t && typeof t.text === "function") ? String(t.text()).slice(0,160) : JSON.stringify(t).slice(0,160);
    console.log("Gemini smoke test OK for", modelName, "sample:", txt);
    return true;
  } catch (err) {
    const msg = err?.message || String(err);
    if (/429|Too Many Requests|Quota/i.test(msg)) {
      const retryMatch = msg.match(/Please retry in ([0-9]+(?:\.[0-9]+)?)s/i);
      const retrySec = retryMatch ? Math.ceil(Number(retryMatch[1]) * 1000) : null;
      return { quotaExceeded: true, retryAfterMs: retrySec, raw: msg };
    }
    console.warn("Smoke test error for", modelName, ":", msg);
    return { error: true, raw: msg };
  }
}

async function initGemini() {
  if (!GEMINI_KEY) {
    console.warn("⚠ GEMINI_API_KEY not set — LLM disabled.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);

    const pick = await chooseModelFromList(GEMINI_KEY);
    if (!pick || pick.status === "error") {
      console.warn("ListModels failed or forbidden; disabling LLM usage.", pick?.error || pick?.code);
      gemini = null;
      embeddingOnlyKey = false;
      return;
    }
    if (pick.status === "embedding_only") {
      console.log("API key appears to be embedding-only. Generative LLM disabled.");
      gemini = null;
      embeddingOnlyKey = true;
      return;
    }
    if (pick.status === "no_gen_model") {
      console.warn("No generative model detected in ListModels response. Models:", pick.models);
      gemini = null;
      embeddingOnlyKey = false;
      return;
    }

    const candidateModels = [];
    if (pick.model) candidateModels.push(pick.model);
    for (const c of preferredCandidates) {
      if (!candidateModels.includes(c)) candidateModels.push(c);
    }

    let initialized = false;
    for (const m of candidateModels) {
      try {
        const smoke = await trySmokeTestModel(genAI, m);
        if (smoke === true) {
          gemini = genAI.getGenerativeModel({ model: m });
          GEMINI_MODEL = m;
          console.log("✔ Gemini initialized and smoke-tested:", GEMINI_MODEL);
          initialized = true;
          break;
        } else if (smoke && smoke.quotaExceeded) {
          console.warn(`Model ${m} quota exceeded. RetryAfter: ${smoke.retryAfterMs || 'unknown'}. Continuing to next candidate.`);
          continue;
        } else {
          console.warn("Smoke test failed for", m, ":", smoke?.raw || smoke);
          continue;
        }
      } catch (err) {
        console.warn("Init attempt for model", m, "failed:", err?.message || err);
      }
    }

    if (!initialized) {
      console.warn("No usable generative model could be smoke-tested. LLM disabled for now.");
      gemini = null;
      embeddingOnlyKey = false;
      return;
    }
  } catch (err) {
    console.error("Gemini init unexpected error:", err?.stack || err);
    gemini = null;
  }
}

// Improved fallback function
async function callGeminiFallback(userText) {
  if (!gemini) return null;
  const systemPrompt = `Bạn là T-Music Assistant, hỗ trợ ngắn gọn bằng tiếng Việt. Trả lời tự nhiên, thân thiện.`;
  try {
    const prompt = `${systemPrompt}\n\nUser: ${userText}`;
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text ? response.text() : (typeof response === "string" ? response : null);
  } catch (err) {
    console.error("Gemini error:", err?.message || err);
    return null;
  }
}

// kick off init
initGemini();

// ---------- UTILS: buildContextPrompt ----------
function buildContextPrompt(docs) {
  return docs.map((d) => `Source: ${d.source}\n\n${d.text}\n\n---\n`).join("\n");
}

// ---------- NEW: sanitizeReply ----------
/**
 * sanitizeReply(reply: string) => string
 * By default (SHOW_SOURCES=false), remove any "Nguồn:" / "Source:" block and everything after it.
 * If SHOW_SOURCES=true, do nothing (useful for debugging).
 */
function sanitizeReply(reply) {
  if (!reply || typeof reply !== "string") return reply;
  if (SHOW_SOURCES) return reply; // do not strip when explicitly requested

  // Remove "Nguồn:" / "Source:" followed by anything until end of string (multiline, case-insensitive)
  // This covers patterns like:
  // "Nguồn: add_song.md" or "Source: add_song.md" and any following text.
  const cleaned = reply.replace(/[\r\n]*\s*(Nguồn|Source)\s*[:\-][\s\S]*$/i, "").trim();

  // Also remove standalone lines that start with "Nguồn" or "Source" (defensive)
  const final = cleaned.replace(/(^|\n)\s*(Nguồn|Source)\s*[:\-]?.*($|\n)/gi, "$1").trim();

  return final;
}

// ---------- MAIN BOT ENDPOINT (NO intent lock; graceful fallback to intents) ----------
app.post("/api/bot/message", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string")
      return res.json({ success: false, message: "No text provided" });

    // If LLM is unavailable and key is embedding-only, fallback to intents (or clear message)
    if (!gemini) {
      if (embeddingOnlyKey) {
        const match = (() => {
          try {
            const t = (text || "").toLowerCase();
            for (const intent of INTENTS) {
              for (const phr of intent.trainingPhrases || []) {
                if ((phr || "").length && t.includes((phr || "").toLowerCase())) return intent;
              }
            }
            return null;
          } catch (e) { return null; }
        })();

        if (match) {
          const responses = match.responses || [];
          const reply = responses[Math.floor(Math.random()*responses.length)];
          // intents are owned by you, they shouldn't include "Nguồn:" blocks — but sanitize anyway
          return res.json({ success: true, source: "intent", intent: match.name, reply: sanitizeReply(reply) });
        }

        return res.json({
          success: true,
          source: "no-llm-embedding-only",
          reply: "Hiện tại API key chỉ hỗ trợ embeddings — chức năng trả lời tự nhiên chưa khả dụng. Nếu bạn là admin, vui lòng cập nhật API key hoặc bật Generative Language API."
        });
      }

      const match2 = (() => {
        try {
          const t = (text || "").toLowerCase();
          for (const intent of INTENTS) {
            for (const phr of intent.trainingPhrases || []) {
              if ((phr || "").length && t.includes((phr || "").toLowerCase())) return intent;
            }
          }
          return null;
        } catch (e) { return null; }
      })();
      if (match2) {
        const responses = match2.responses || [];
        const reply = responses[Math.floor(Math.random()*responses.length)];
        return res.json({ success: true, source: "intent", intent: match2.name, reply: sanitizeReply(reply) });
      }

      return res.json({
        success: true,
        source: "no-llm",
        reply: "Tính năng trả lời tự nhiên hiện không khả dụng (LLM không hoạt động). Bạn có thể thử hỏi theo form mẫu hoặc admin cập nhật API key."
      });
    }

    // Normal flow when gemini exists: RAG -> generateContent
    let docs = [];
    try { docs = await retrieve(text, 4); } catch(e){ docs = []; console.warn("Retrieve err", e?.message||e); }

    if (docs && docs.length) {
      const context = buildContextPrompt(docs);
      const ragPrompt = `
Bạn là trợ lý T-Music.
Hãy trả lời tự nhiên bằng tiếng Việt.
Nếu CONTEXT có thông tin để trả lời thì CHỈ sử dụng thông tin trong CONTEXT.
Nếu CONTEXT không đủ, trả lời theo kiến thức chung (văn phong thân thiện, ngắn gọn).

CONTEXT:
${context}

CÂU HỎI: ${text}
      `;

      try {
        const result = await gemini.generateContent(ragPrompt);
        const response = await result.response;
        const rawReply = response.text ? response.text() : (typeof response === "string" ? response : null);

        // sanitize reply before sending to client (remove "Nguồn:" / "Source:" blocks)
        const reply = sanitizeReply(rawReply);

        // Log docs server-side for debugging, but don't expose to client unless SHOW_SOURCES=true
        if (SHOW_SOURCES) {
          return res.json({ success: true, source: "llm-rag", reply, docs });
        } else {
          // IMPORTANT: do not return docs to client to avoid showing "Nguồn"
          return res.json({ success: true, source: "llm-rag", reply });
        }
      } catch (err) {
        console.error("Gemini RAG error:", err?.message || err);
      }
    }

    // 3) Fallback: call Gemini without context (free-form)
    const finalRaw = await callGeminiFallback(text);
    const final = sanitizeReply(finalRaw);

    return res.json({
      success: true,
      source: final ? "llm-fallback" : "fallback-none",
      reply: final || "Xin lỗi, hệ thống LLM hiện không khả dụng. Bạn thử lại sau nhé!",
    });
  } catch (err) {
    console.error("Server error:", err?.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------- RUN SERVER ----------
app.listen(PORT, () => {
  console.log(`Bot server listening on port ${PORT}`);
});
