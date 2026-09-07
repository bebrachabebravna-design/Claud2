import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./theme";

/**
 * Sound design.
 *
 * The rule taken from the references: every arrival on screen has a sound, and
 * no sound plays without something arriving. A click with nothing moving reads
 * as a mistake; an element landing in silence reads as a dropped frame.
 *
 * Levels are set low on purpose. These sit under a music bed that gets added
 * later, so anything mixed to feel right in isolation will be far too loud in
 * the finished reel.
 */

/** The library currently in `public/audio/sfx`, mapped to what it is used for. */
export const SFX = {
  /** Short tick for a word or a chip landing. */
  tick: "Click_6.wav",
  tick2: "Click_10.wav",
  tick3: "Click_11.wav",
  /** Heavier click for a card or a panel. */
  pop: "Icon_2.wav",
  /** Air movement under a chapter sweep. */
  whoosh: "Cam_2.mp3",
  whoosh2: "Cam_4.mp3",
  /** Interface / data beats: counters, progress, the product doing something. */
  data: "Data_2.wav",
  data2: "Data_5.wav",
  digital: "Digital_6.wav",
  digital2: "Digital_12.wav",
  digital3: "Digital_15.wav",
  /** Typing. */
  keys: "Keyboard_1.wav",
} as const;

export type SfxName = keyof typeof SFX;

/** One sound at one moment, in seconds from the start of the composition. */
export type Cue = { at: number; sfx: SfxName; volume?: number };

/**
 * Plays a cue list. Each cue gets its own Sequence so overlapping sounds mix
 * rather than cutting one another off, which is what happens if a single Audio
 * element is retargeted.
 */
export const SfxTrack: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={`${c.sfx}-${c.at}-${i}`} from={Math.round(c.at * FPS)} layout="none">
        <Audio src={staticFile(`audio/sfx/${SFX[c.sfx]}`)} volume={c.volume ?? 0.4} />
      </Sequence>
    ))}
  </>
);

/**
 * Builds a run of ticks for a word-by-word build, so the cue list stays
 * readable instead of listing eight near-identical entries by hand.
 */
export const ticks = (
  start: number,
  count: number,
  step = 4 / FPS,
  volume = 0.22
): Cue[] =>
  Array.from({ length: count }, (_, i) => ({
    at: start + i * step,
    // Rotating three samples stops a run of words sounding like a machine.
    sfx: (["tick", "tick2", "tick3"] as const)[i % 3],
    volume,
  }));
