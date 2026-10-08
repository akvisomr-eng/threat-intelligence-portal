import http from "node:http";

const PORT = Number(process.env.PORT || 10000);
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || "";
const MAX_CHARS = Number(process.env.MAX_TTS_CHARS || 3500000);
let charsThisProcess = 0;

const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  });
  res.end(JSON.stringify(body));
};

async function synthesize(text, voice = "id-ID-Standard-A") {
  if (!GOOGLE_TTS_API_KEY) throw new Error("VOICE_PROVIDER_NOT_CONFIGURED");
  const clean = String(text || "").trim();
  if (!clean) throw new Error("EMPTY_TEXT");
  if (clean.length > MAX_CHARS - charsThisProcess) throw new Error("FREE_QUOTA_GUARD");

  const response = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
      encodeURIComponent(GOOGLE_TTS_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: clean },
        voice: { languageCode: "id-ID", name: voice },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.96, pitch: 0 }
      })
    }
  );

  const data = await response.json();
  if (!response.ok || !data.audioContent) {
    throw new Error(data?.error?.message || "TTS_PROVIDER_ERROR");
  }
  charsThisProcess += clean.length;
  return data.audioContent;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, {
      ok: true,
      service: "AURA Voice API",
      locale: "id-ID",
      provider: GOOGLE_TTS_API_KEY ? "google-cloud-tts" : "not-configured",
      infrastructure: "Rp0"
    });
  }
  if (req.method !== "POST" || req.url !== "/tts") {
    return json(res, 404, { error: "NOT_FOUND" });
  }

  let raw = "";
  req.on("data", chunk => {
    raw += chunk;
    if (raw.length > 30000) req.destroy();
  });
  req.on("end", async () => {
    try {
      const body = JSON.parse(raw || "{}");
      const audioContent = await synthesize(body.text, body.voice);
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(Buffer.from(audioContent, "base64"));
    } catch (error) {
      const code = error.message === "FREE_QUOTA_GUARD" ? 429 :
        error.message === "VOICE_PROVIDER_NOT_CONFIGURED" ? 503 : 400;
      json(res, code, { error: error.message });
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("AURA Voice API listening on " + PORT);
});
