# human/ — a human body computed in code

A reusable human for 雪迹 and later games: no model files, no textures. Everything lives under one global, `Human`.

- `src/00_math.js` vectors, quaternions, swing-twist.
- `src/01_params.js` sex, stature, mass, body fat, frame → the measurements to build to (ANSUR II regressions).
- `src/02_skeleton.js` 59 bones (a superset of VRM / Unity Humanoid), joint ranges, anatomical poses → bone rotations: spine bend shared over five bones, scapulohumeral rhythm, twist bones.
- `src/03_body.js` the volume: lofted superellipse sections riding the bones, 34 muscles per side as volume-preserving relief (r ∝ √(L₀/L)), head forms.
- `src/04_mesh.js` sparse surface nets in the bind pose; normals; volume.
- `src/05_measure.js` girths measured like a tape (convex hull of a slice); radii fitted until the girths are ANSUR's.
- `src/06_skin.js` weights from the body's own pieces; LBS, DQS, and DQS + projection onto the posed body (implicit-skinning style).
- `src/07_poses.js` the stress poses; grounding.
- `lab/` the 人体实验室 page. `node human/build.js` → `human/dist/lab.html` (and `human/dist/human.js`, the module alone).
- `tools/render.js` renders a turntable, a pose loop and a skinning comparison sheet (needs playwright and ffmpeg).

Data: ANSUR II (US Army, public release), CDC / AAOS joint ranges, McClure 2001 shoulder rhythm, de Leva 1996. Research notes behind every number: the project's research reports 01–08.

## Motion (src/08_motion.js)

`Human.Motion.CLIPS` are functions of a phase that return an anatomical pose; `Human.Motion.sample(sk, clip, t)` puts the feet (or the skis /
snowboard under them) on the floor and adds the flight. Daily: walk, run (textbook gait curves), jump, squat. Skis: carved turn (lean, hip
height and shoulder turn per phase from `data/mocap/turn_cycle_cc_slalom.json`, CC BY 3.0, the legs solved onto parallel skis), tuck, moguls,
two jumps. Snowboard: ride, toe / heel edge, jump with a grab. `Human.Motion.gear` gives the skis / board as boxes. The lab plays them under
"动作" (`?clip=walk`). Muscle definition is the `def` parameter (0..2); it fades with body fat.
