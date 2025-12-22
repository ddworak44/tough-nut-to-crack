export const SORA_BEFORE_AFTER_PROMPT = `
The input reference image is a CONTROL DIAGRAM with TWO DISTINCT STATES.

LEFT PANEL = BEFORE STATE (initial state).
RIGHT PANEL = AFTER STATE (final state).
These labels are authoritative and must be obeyed.

The video MUST begin matching the LEFT (Before) state exactly.
The video MUST end matching the RIGHT (After) state exactly.
The transition must be continuous and monotonic from Before → After.
Do NOT reverse, blend, or reinterpret the direction.

The subject, framing, and camera perspective must remain consistent.
Only the changes implied by Before versus After may evolve over time.
No new objects. No removed objects. No reframing.

The output video MUST NOT show a split screen or composite layout.
The output MUST be a single full-frame scene.
No text overlays. No labels. No UI elements.

DO NOT average the two images.
DO NOT hallucinate intermediate layouts.
DO NOT introduce motion unrelated to the transition.
DO NOT treat the image as a collage, comparison, or storyboard.
DO NOT reorder or reinterpret which side is Before or After.

This is not a comparison image; it is a strict before-to-after transformation specification.

Any output that does not start identical to the Before state and end identical to the After state is invalid.
`.trim();
