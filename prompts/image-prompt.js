import { adhocPrompt } from "./adhoc/index.js";

export const imagePrompt = `The input image is a rough hand-drawn sketch used ONLY as a spatial and compositional guide.

Interpret the sketch as follows:
- The orange figure represents a humanoid animal character standing upright.
- The character is holding a tall vertical object on the left.
- Two tall vertical background elements rise behind the character.
- The red shapes at the top represent a stylized canopy or large abstract forms overhead.

Ignore:
- Line quality
- Scribbles
- Colors of the sketch
- Any literal interpretation of strokes

Preserve ONLY:
- Character pose
- Relative scale between character and background elements
- Overall scene composition

Re-render the scene completely in a polished, cinematic, animated style similar to a modern Disney-style animated film (e.g., Zootopia):
- Anthropomorphic animal character
- Clean character design
- Expressive face
- Soft lighting
- High-quality animation film rendering
- Smooth surfaces, detailed materials
- Subtle depth of field

This should look like a final animation still, not a sketch, not concept art, and not a painting.

Be sure to remove any foreign UI elements or text from the image, unless they are part of the scene.

${adhocPrompt}`;
