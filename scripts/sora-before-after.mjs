// scripts/sora-before-after.mjs
//
// Usage:
//   npm run sora:before-after -- assets/before.png assets/after.png output/transition.mp4
//
// Requires:
//   - Node 18+
//   - OPENAI_API_KEY in environment
//   - npm i sharp
//
// Behavior:
//   - Creates ./before_after.png (white canvas, two screenshots)
//   - POST /v1/videos with input_reference=@before_after.png
//   - Polls GET /v1/videos/{id} until completed/failed
//   - Downloads GET /v1/videos/{id}/content -> out.mp4

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

/* -------------------- config -------------------- */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const [beforePath, afterPath, outVideoPath = "out.mp4"] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error(
    "Usage: node scripts/sora-before-after.mjs <before.png> <after.png> [out.mp4]"
  );
  process.exit(1);
}

const MODEL = "sora-2-2025-12-08";
const SECONDS = "4"; // allowed: 4 | 8 | 12
const SIZE = "720x1280"; // MUST match composite dimensions

/* -------------------- helpers -------------------- */

function parseSize(sizeStr) {
  const m = /^(\d+)x(\d+)$/.exec(sizeStr);
  if (!m) throw new Error(`Invalid SIZE: ${sizeStr}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

function captionSvg(text, width, height, opts) {
  // Supports:
  // - captionSvg(text,w,h,"#E5E7EB")  (old style: bg bar, dark text)
  // - captionSvg(text,w,h,{ bgColor, textColor, fontWeight })
  const o =
    typeof opts === "string"
      ? { bgColor: opts, textColor: "#111", fontWeight: 800 }
      : {
          bgColor: opts?.bgColor,
          textColor: opts?.textColor ?? "#111",
          fontWeight: opts?.fontWeight ?? 800,
        };
  const hasBg = Boolean(o.bgColor);
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${
        hasBg
          ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${o.bgColor}" />`
          : ""
      }
      <text x="${Math.floor(width / 2)}" y="${Math.floor(height / 2)}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${Math.floor(height * 0.75)}"
            fill="${o.textColor}"
            style="font-weight: ${o.fontWeight};">
        ${text}
      </text>
    </svg>
  `);
}

function frameSvg(width, height, strokeColor, strokeWidth, radius = 16) {
  const inset = Math.max(1, Math.floor(strokeWidth / 2));
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${inset}"
        y="${inset}"
        width="${Math.max(1, width - inset * 2)}"
        height="${Math.max(1, height - inset * 2)}"
        rx="${radius}"
        ry="${radius}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
      />
    </svg>
  `);
}

/* -------------------- composite -------------------- */

async function createWhiteCanvasComposite(
  beforeFile,
  afterFile,
  outImage = "before_after.png"
) {
  const { w: canvasW, h: canvasH } = parseSize(SIZE);

  // Layout tuned for 720x1280
  const marginX = Math.round(canvasW * 0.04); // ~29px
  const marginTop = Math.round(canvasH * 0.05); // ~64px
  const marginBottom = Math.round(canvasH * 0.04); // ~51px
  const gutter = Math.round(canvasW * 0.04); // ~29px
  const captionH = Math.round(canvasH * 0.045); // label line (no background bar)
  const labelGap = Math.max(6, Math.round(canvasH * 0.008)); // small space above frame
  const borderW = Math.max(6, Math.round(canvasW * 0.01)); // ~7px on 720w
  const START_COLOR = "#16A34A"; // green
  const END_COLOR = "#DC2626"; // red

  const regionTop = marginTop + captionH;
  const regionH = canvasH - regionTop - marginBottom;
  const regionW = canvasW - 2 * marginX - gutter;
  const slotW = Math.floor(regionW / 2);

  // Resize screenshots to fit slots without cropping
  const before = await sharp(beforeFile)
    .resize(slotW, regionH, {
      // "inside" preserves aspect ratio and DOES NOT pad to the full box
      // (so our border can match the true resized image bounds).
      fit: "inside",
    })
    .png()
    .toBuffer();

  const after = await sharp(afterFile)
    .resize(slotW, regionH, {
      fit: "inside",
    })
    .png()
    .toBuffer();

  const beforeMeta = await sharp(before).metadata();
  const afterMeta = await sharp(after).metadata();

  const beforeW = beforeMeta.width ?? slotW;
  const beforeH = beforeMeta.height ?? regionH;
  const afterW = afterMeta.width ?? slotW;
  const afterH = afterMeta.height ?? regionH;

  const leftSlotX = marginX;
  const rightSlotX = marginX + slotW + gutter;

  const beforeX = leftSlotX + Math.floor((slotW - beforeW) / 2);
  const beforeY = regionTop + Math.floor((regionH - beforeH) / 2);

  const afterX = rightSlotX + Math.floor((slotW - afterW) / 2);
  const afterY = regionTop + Math.floor((regionH - afterH) / 2);

  // Labels should sit directly above the framed images (not above the whole slot)
  const beforeLabelTop = Math.max(0, beforeY - captionH - labelGap);
  const afterLabelTop = Math.max(0, afterY - captionH - labelGap);

  const base = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  });

  const composed = await base
    .composite([
      { input: before, left: beforeX, top: beforeY },
      { input: after, left: afterX, top: afterY },
      // Frames on top of the resized images (border matches true image bounds)
      {
        input: frameSvg(beforeW, beforeH, START_COLOR, borderW),
        left: beforeX,
        top: beforeY,
      },
      {
        input: frameSvg(afterW, afterH, END_COLOR, borderW),
        left: afterX,
        top: afterY,
      },
      // Labels centered directly above each frame
      {
        input: captionSvg("BEFORE", beforeW, captionH, {
          textColor: START_COLOR,
        }),
        left: beforeX,
        top: beforeLabelTop,
      },
      {
        input: captionSvg("AFTER", afterW, captionH, { textColor: END_COLOR }),
        left: afterX,
        top: afterLabelTop,
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(outImage, composed);
  return outImage;
}

/* -------------------- api -------------------- */

async function createVideoJob(inputReferencePath) {
  const fd = new FormData();
  fd.append("model", MODEL);
  fd.append(
    "prompt",
    [
      "The input reference is a white canvas showing two phone screenshots.",
      "LEFT is the Before state and RIGHT is the After state.",
      "Create a short video that smoothly transitions from the Before state to the After state.",
      "Do not show the split layout in the output.",
      "No text overlays. No hard cuts. Keep content non-graphic.",
    ].join(" ")
  );
  fd.append("seconds", SECONDS);
  fd.append("size", SIZE);

  const bytes = await readFile(inputReferencePath);
  fd.append(
    "input_reference",
    new Blob([bytes], { type: "image/png" }),
    "before_after.png"
  );

  const res = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function getVideoStatus(id) {
  const res = await fetch(`https://api.openai.com/v1/videos/${id}`, {
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function pollUntilDone(
  id,
  { intervalMs = 1500, timeoutMs = 180000 } = {}
) {
  const start = Date.now();
  while (true) {
    const v = await getVideoStatus(id);
    console.log(
      `[${new Date().toISOString()}] status=${v.status}` +
        (v.progress != null ? ` progress=${v.progress}` : "")
    );
    if (v.status === "completed" || v.status === "failed") return v;
    if (Date.now() - start > timeoutMs) throw new Error("Timed out");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

async function downloadVideoContent(id, outPath) {
  const res = await fetch(`https://api.openai.com/v1/videos/${id}/content`, {
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Download failed (${res.status}): ${text}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`✅ Saved ${buf.length} bytes to ${outPath}`);
}

/* -------------------- main -------------------- */

(async () => {
  const compositePath = await createWhiteCanvasComposite(
    beforePath,
    afterPath,
    "before_after.png"
  );
  console.log(`✅ Wrote composite reference image: ${compositePath}`);

  const created = await createVideoJob(compositePath);
  console.log(`✅ Created job: ${created.id} (status=${created.status})`);

  const final = await pollUntilDone(created.id);
  if (final.status === "failed") {
    console.error("❌ Video failed:", final.error);
    process.exit(1);
  }

  await downloadVideoContent(created.id, outVideoPath);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
