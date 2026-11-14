# Mocap data credits

Numbers derived from real skiing video (MediaPipe Pose Landmarker heavy → L/R repair → turns cut at edge change →
mirrored → 32 phases/turn → per-phase median → 4-harmonic Fourier smoothing). No video frames included.

| File | Source video | Author | Licence |
|---|---|---|---|
| `turn_cycle_cc.json` | "Royalty Free Skiing Footage \| No Copyright Ski Footage", 5:04–5:20 — https://www.youtube.com/watch?v=LyhcXKZ4QMM | Eye Definition | CC BY |
| `turn_cycle_cc_slalom.json` | "Erika Terai als voorloper bij de slalom wedstrijd, -8 feb 2013 a", 0:04–0:10 — https://commons.wikimedia.org/wiki/File:Erika_Terai_als_voorloper_bij_de_slalom_wedstrijd,_-8_feb_2013_a.webm | jx3g4644 from Japan | CC BY 3.0 |
| `turn_cycle_pexels_racer.json` | Pexels video 38955629 — https://www.pexels.com/video/dynamic-slalom-skiing-on-snowy-course-38955629/ | Pexels contributor | Pexels License (not CC) |

Reliability: the sideways plane (inclination, hip height, leg spread, arm height) is usable in all three; fore/aft depth is
only plausible in `turn_cycle_cc_slalom.json` (the other two have shins leaning backward — a single-camera depth error).
