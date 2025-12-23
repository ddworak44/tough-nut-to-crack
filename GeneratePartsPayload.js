/**
 * GeneratePartsPayload.js
 *
 * Utility for building dynamic parts payloads for Gemini API requests.
 * Supports arbitrary combinations of text prompts and image data.
 */

/**
 * Builds a parts array for Gemini API generateContent requests
 * @param {Array} inputs - Array of input objects with imageBuffer and optional prompt
 * @returns {Array} Array of parts for the Gemini API
 */
export function buildPartsPayload(inputs) {
  const parts = [];

  for (const input of inputs) {
    // Add text prompt if present
    if (input.prompt) {
      parts.push({ text: input.prompt });
    }

    // Add image data (assuming input has imageBuffer)
    if (input.imageBuffer) {
      parts.push({
        inlineData: {
          data: input.imageBuffer.toString("base64"),
          mimeType: input.mimeType || "image/png", // Default to PNG, allow override
        },
      });
    }
  }

  return parts;
}

/**
 * Legacy function for single image + prompt (backward compatibility)
 * @param {string} imagePrompt - Text prompt
 * @param {Buffer} inputImage - Image buffer
 * @param {string} mimeType - MIME type (defaults to "image/png")
 * @returns {Array} Array of parts for the Gemini API
 */
export function buildSingleImageParts(
  imagePrompt,
  inputImage,
  mimeType = "image/png"
) {
  return buildPartsPayload([
    {
      prompt: imagePrompt,
      imageBuffer: inputImage,
      mimeType: mimeType,
    },
  ]);
}
