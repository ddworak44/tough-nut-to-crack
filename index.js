import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

async function generateVideo() {
  const form = new FormData();

  // Required
  form.append("model", "sora-2-2025-12-08");
  form.append(
    "prompt",
    "Animate this poster subtly with cinematic lighting, gentle motion, and ambient city sound."
  );

  // Optional but recommended
  form.append("seconds", "4"); // allowed: 4 | 8 | 12
  form.append("size", "720x1280"); // or 1280x720

  // OPTIONAL: include ONE reference image
  if (fs.existsSync("./poster.jpg")) {
    form.append("input_reference", fs.createReadStream("./poster.jpg"));
  }

  const res = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Request failed: ${res.status}\n${errText}`);
  }

  const result = await res.json();
  console.log(JSON.stringify(result, null, 2));
}

generateVideo().catch(console.error);
