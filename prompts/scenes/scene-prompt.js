import { adhocPrompt } from "../../prompts/adhoc/index.js";

export const scenePrompt = `The input image is a rough mockup used ONLY as a spatial and compositional guide.

Interpret the sketch as follows:
${adhocPrompt}

Re-render the scene completely in a polished, cinematic, animated style similar to a modern Disney-style animated film (SPECIFICALLY, Zootopia):
- Soft lighting
- High-quality animation film rendering
- Smooth surfaces, detailed materials
- Subtle depth of field

This should look like a final animation still, not a sketch, not concept art, and not a painting.

Be sure to remove any foreign UI elements or text from the image, unless they are part of the scene. A key aspect that cannot be overstated is that this must capture the magic and whimsicality of Zootopia. It should NOT include any animals or characters. It is simply framing a particular scenario`;
