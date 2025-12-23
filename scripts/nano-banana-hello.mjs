// scripts/nano-banana-hello.mjs
//
// Usage:
//   node scripts/nano-banana-hello.mjs
//
// Description:
//   Generates a "Nano Banana" image using the centralized Google GenAI client.

import { readFile, writeFile } from "node:fs/promises";
import { ai } from "../lib/veo.js";
import { characterPrompt } from "../prompts/character.js";
import { scale } from "../options/scale.js";
import { scenePrompt } from "../prompts/scenes/scene-prompt.js";
import { buildPartsPayload } from "../GeneratePartsPayload.js";
import { iterateCharacterPrompt } from "../prompts/character.js";

async function generateBananaImage() {
  console.log("Reading reference image from assets...");
  const inputImage = await readFile("./assets/scenes/bench.png");

  console.log(
    "Requesting image generation from Nano Banana (Gemini) with reference..."
  );

  try {
    const modelId = "gemini-2.5-flash-image"; // As requested

    // Build parts payload dynamically
    const inputs = [
      {
        prompt: scenePrompt,
        imageBuffer: inputImage,
        mimeType: "image/png",
      },
    ];

    const parts = buildPartsPayload(inputs);

    // We use the centralized 'ai' client.
    // Note: generateContent is the standard method for Gemini image/text models.
    const result = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
    });

    // Handle different response structures between AI Studio and Vertex AI modes
    const response = result.response || result;

    // The image data is typically returned in the candidates
    let imageFound = false;
    const candidates = response.candidates || response[0]?.candidates;

    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const outputPath = `output/images/generated_image_${Date.now()}.png`;
          await writeFile(outputPath, buffer);
          console.log(`✅ Image saved as ${outputPath}`);
          imageFound = true;
        }
      }
    }

    if (!imageFound) {
      console.log("No image data found in the response parts.");
      console.log(
        "Response structure:",
        JSON.stringify(
          response,
          (key, value) => (key === "inlineData" ? "[Base64 Data]" : value),
          2
        )
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error.message.includes("not found")) {
      console.warn(
        "\nTip: If 'gemini-2.5-flash-image' is not available in your region yet, you might need to use 'imagen-3.0-generate-001' or similar."
      );
    }
  }
}

generateBananaImage().catch(console.error);
