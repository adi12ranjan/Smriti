// Online text-to-speech proxy used by Smriti for Hindi, Bengali, Assamese and
// Manipuri on devices that have no local voice for those languages.
// The browser calls /api/tts?lang=hi&q=<text>; this route fetches the audio on the
// server (the speech service blocks direct browser calls) and returns MP3.

export const runtime = "nodejs"

// App language -> speech-service language. Manipuri text is written in Bengali
// script in this app, so it is spoken with the Bengali voice.
const LANG_MAP: Record<string, string[]> = {
  en: ["en-IN"],
  hi: ["hi"],
  bn: ["bn"],
  as: ["as", "bn"], // try Assamese first, fall back to Bengali
  mni: ["bn"],
}

async function fetchAudio(tl: string, q: string): Promise<ArrayBuffer | null> {
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&total=1&idx=0" +
    `&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(q)}&textlen=${q.length}`
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    })
    if (!res.ok) return null
    const type = res.headers.get("content-type") ?? ""
    if (!type.includes("audio")) return null
    const buf = await res.arrayBuffer()
    return buf.byteLength > 0 ? buf : null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get("lang") ?? ""
  const q = (searchParams.get("q") ?? "").trim()
  const targets = LANG_MAP[lang]
  if (!targets || !q || q.length > 200) {
    return new Response("Bad request", { status: 400 })
  }
  for (const tl of targets) {
    const audio = await fetchAudio(tl, q)
    if (audio) {
      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
        },
      })
    }
  }
  return new Response("Voice unavailable", { status: 502 })
}
