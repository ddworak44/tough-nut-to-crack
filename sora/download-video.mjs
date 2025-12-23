// download-video.mjs
// Usage: node download-video.mjs video_<id> poster.mp4

import { writeFile } from "node:fs/promises";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const [videoId, outFile = "output.mp4"] = process.argv.slice(2);
if (!videoId) {
  console.error("Usage: node download-video.mjs <video_id> [output.mp4]");
  process.exit(1);
}

const url = `https://api.openai.com/v1/videos/${videoId}/content`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Download failed (${res.status}): ${text}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
await writeFile(outFile, buf);

console.log(`✅ Saved ${buf.length} bytes to ${outFile}`);
