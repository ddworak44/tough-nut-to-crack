// scripts/veo-hello-world.mjs
//
// Usage:
//   export GOOGLE_API_KEY=your_api_key
//   node scripts/veo-hello-world.mjs
//
// Requires:
//   npm install @google/genai

import { GoogleGenAI } from "@google/genai";
import { readFile, writeFile } from "node:fs/promises";

// Initialize the GenAI client
const ai = new GoogleGenAI({
  vertexai: true,
  project: "poster-screenshot", // from your gcp.json
  location: "us-central1", // Veo 3.1 is typically here
});

async function generateVeoVideo() {
  const prompt =
    "A cinematic transition showing the evolution from the first state to the second state, maintaining consistent lighting and camera position.";

  console.log("Reading images from assets...");
  const firstImage = await readFile("./assets/before.png");
  const lastImage = await readFile("./assets/after.png");

  console.log("Requesting video generation from Veo 3.1...");

  let operation = await ai.models.generateVideos({
    model: "veo-3.1-generate-preview",
    prompt: prompt,
    image: {
      imageBytes: firstImage.toString("base64"),
      mimeType: "image/png",
    },
    config: {
      lastFrame: {
        imageBytes: lastImage.toString("base64"),
        mimeType: "image/png",
      },
    },
  });

  console.log(`Job started. Operation ID: ${operation.name}`);

  // Poll for completion
  while (!operation.done) {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  console.log("\nVideo generation complete!");

  // Download and save the video
  const generatedVideo = operation.response.generatedVideos[0];
  const video = generatedVideo.video;

  let videoBuffer;
  if (video.videoBytes) {
    console.log("Video bytes found in response.");
    videoBuffer = Buffer.from(video.videoBytes, "base64");
  } else if (video.uri) {
    console.log(`Downloading video from: ${video.uri}`);
    const downloadResponse = await ai.files.download({
      file: video,
    });
    // The download response might be a Blob or ArrayBuffer depending on environment
    videoBuffer = Buffer.from(await downloadResponse.arrayBuffer());
  } else {
    throw new Error("No video bytes or URI found in the response.");
  }

  const outputPath = "output/veo_hello_world.mp4";
  await writeFile(outputPath, videoBuffer);

  console.log(`✅ Generated video saved to ${outputPath}`);
}

generateVeoVideo().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
