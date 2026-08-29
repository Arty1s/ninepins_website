import { NextResponse } from "next/server";

const CHANNEL_ID = "UC2J2FVlhwWssXM-Rexx3N3g";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${CHANNEL_URL}/live`, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "accept-language": "sk,en;q=0.8",
        "user-agent": "Mozilla/5.0 (compatible; KKZHlohovecWebsite/1.0)"
      }
    });
    if (!response.ok) return inactive();

    const html = await response.text();
    if (!/"isLiveNow"\s*:\s*true/.test(html)) return inactive();

    const videoId = html.match(/"videoDetails"\s*:\s*\{\s*"videoId"\s*:\s*"([\w-]{11})"/)?.[1]
      || html.match(/"videoId"\s*:\s*"([\w-]{11})"/)?.[1];
    if (!videoId) return inactive();

    const rawTitle = html.match(/"videoDetails"\s*:\s*\{[^}]*"title"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1] || "KKZ Hlohovec naživo";
    const title = decodeJsonString(rawTitle);
    return NextResponse.json({
      active: true,
      videoId,
      title,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return inactive();
  }
}

function inactive() {
  return NextResponse.json({ active: false, channelUrl: CHANNEL_URL }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

function decodeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}
