import { GoogleGenAI } from "@google/genai";

/**
 * Centralized Google GenAI client for Veo 3.1
 */
export const ai = new GoogleGenAI({
  vertexai: true,
  project: "poster-screenshot", // from gcp.json
  location: "us-central1", // Veo 3.1 is typically here
});
