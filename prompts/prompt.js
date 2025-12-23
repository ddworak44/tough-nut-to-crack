export const prompt = `
Generate a single continuous cinematic video that depicts a STRICT, DETERMINISTIC transition from the INITIAL state to the FINAL state, rendered as an ARTISTIC and NATURAL evolution of the scene.

AUTHORITATIVE STATES:
- The FIRST frame of the video MUST match the initial (before) state exactly.
- The LAST frame of the video MUST match the final (after) state exactly.

ARTISTIC INTERPRETATION (IMPORTANT):
- The transition should feel like a natural, cinematic progression, not a mechanical or UI-driven effect.
- This is NOT a PowerPoint-style transition (no wipes, slides, fades, zooms, dissolves, or template animations).
- The evolution should feel organic and visually motivated, as if the scene itself is transforming over time.
- Artistic interpretation is allowed ONLY in how the intermediate moments unfold, not in changing the endpoints.

TRANSITION RULES:
- The video MUST smoothly and monotonically interpolate from initial → final.
- The model MUST fill in plausible intermediate frames that bridge the two states.
- No cuts, jumps, reversals, looping, or branching timelines.
- The transformation must proceed in one direction only.

SCENE CONSTRAINTS:
- Camera position, framing, focal length, and perspective MUST remain fixed.
- Lighting direction, intensity, and color temperature MUST remain consistent.
- The environment, background, and spatial layout MUST remain unchanged.

OBJECT CONSTRAINTS:
- No new objects may appear.
- No existing objects may disappear.
- Only attributes that differ between the initial and final states may evolve over time.
- All unchanged attributes must remain identical throughout the video.

FORBIDDEN:
- No split screens, composites, overlays, captions, labels, UI elements, or text.
- No stylistic transition effects associated with presentation software or video templates.
- Do NOT average, exaggerate, or invent content beyond what is implied by the two states.

GOAL:
Produce a cinematic, expressive, and physically plausible temporal evolution that artistically merges the initial and final states into one continuous scene, with all intermediate frames representing valid moments of the same reality.
`;
