// get-video-status.js
// Usage: node get-video-status.js video_<id>

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const videoId = process.argv[2];

if (!videoId) {
  console.error("Usage: node get-video-status.js <video_id>");
  process.exit(1);
}

async function getVideoStatus(id) {
  const res = await fetch(`https://api.openai.com/v1/videos/${id}`, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function pollVideo(id, { intervalMs = 2000, timeoutMs = 180000 } = {}) {
  const start = Date.now();

  while (true) {
    const video = await getVideoStatus(id);

    console.log(
      `[${new Date().toISOString()}] status=${video.status}` +
        (video.progress != null ? ` progress=${video.progress}` : "")
    );

    if (video.status === "completed") {
      console.log("\n✅ Video completed:");
      console.log(JSON.stringify(video, null, 2));
      return;
    }

    if (video.status === "failed") {
      console.error("\n❌ Video failed:");
      console.error(JSON.stringify(video.error, null, 2));
      return;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for video completion");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

pollVideo(videoId).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
