import { interpolate, useCurrentFrame, useVideoConfig, spring, random } from "remotion";
import { BLUE, CYAN, YELLOW } from "../fonts";

/**
 * Procedural 3D props, built from primitives rather than imported GLTF assets.
 *
 * Everything the reel needs to show — paper, contracts, cards, a phone — is
 * boxes and planes, so modelling them here keeps them exactly on the brand
 * palette and lets the animation drive geometry directly. Bought assets would
 * arrive in someone else's colours and lighting.
 *
 * All of these are meant to sit BEHIND the cut-out speaker, so they are lit
 * from the same side as the take (key from camera-left, cyan rim from the
 * right) and they cast real shadows — that shadow is most of what makes the
 * composite read as one space instead of a sticker.
 */

/** Eases a prop in from below with a settle, then holds. */
const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.9 },
  });
};

/** A leaning stack of pages — the "20 страниц" prop. */
export const PaperStack: React.FC<{
  count?: number;
  position?: [number, number, number];
  delay?: number;
}> = ({ count = 14, position = [0, 0, 0], delay = 0 }) => {
  const frame = useCurrentFrame();
  const e = useEnter(delay);
  const spin = interpolate(frame, [0, 120], [0, 0.5]);

  return (
    <group
      position={[position[0], position[1] - (1 - e) * 3, position[2]]}
      rotation={[0.35, spin - 0.4, 0.06]}
      scale={interpolate(e, [0, 1], [0.6, 1])}
    >
      {new Array(count).fill(0).map((_, i) => {
        const jitter = random(`p${i}`) - 0.5;
        // Each sheet lands a beat after the one below it, so the stack builds.
        const li = interpolate(e, [i / (count * 2), 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[jitter * 0.12 * li, i * 0.035, jitter * 0.1 * li]}
            rotation={[0, jitter * 0.14 * li, 0]}
          >
            <boxGeometry args={[2.1, 0.025, 2.95]} />
            <meshStandardMaterial
              color={i === count - 1 ? "#FFFFFF" : "#E8EDF5"}
              roughness={0.85}
              metalness={0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * A single contract page with one clause lit up — the visual answer to
 * "отвечает со ссылкой на пункт". The highlight sweeps down the page and
 * settles on one line.
 */
export const ContractPage: React.FC<{
  position?: [number, number, number];
  delay?: number;
  accent?: string;
}> = ({ position = [0, 0, 0], delay = 0, accent = YELLOW }) => {
  const frame = useCurrentFrame();
  const e = useEnter(delay);
  const sweep = interpolate(frame - delay, [10, 45], [1.1, -0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lock = interpolate(frame - delay, [45, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <group
      position={position}
      rotation={[0, interpolate(e, [0, 1], [-0.9, -0.28]), 0]}
      scale={interpolate(e, [0, 1], [0.7, 1])}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.6, 3.6, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>

      {/* Text lines, faked as thin bars so the page reads as a document. */}
      {new Array(11).fill(0).map((_, i) => (
        <mesh key={i} position={[-0.25 - random(`w${i}`) * 0.3, 1.45 - i * 0.29, 0.031]}>
          <planeGeometry args={[1.6 + random(`w${i}`) * 0.5, 0.075]} />
          <meshBasicMaterial color="#C3CCDA" />
        </mesh>
      ))}

      {/* The clause the agent would cite. */}
      <mesh position={[0, sweep, 0.035]}>
        <planeGeometry args={[2.45, 0.34]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55 + lock * 0.35} />
      </mesh>
    </group>
  );
};

/** A floating info card — used for СРОКИ / ШТРАФЫ / УСЛОВИЯ. */
export const InfoCard: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  delay?: number;
  edge?: string;
  lines?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], delay = 0, edge = CYAN, lines = 3 }) => {
  const frame = useCurrentFrame();
  const e = useEnter(delay);
  const float = Math.sin((frame - delay) / 22) * 0.07;

  return (
    <group
      position={[
        position[0] + (1 - e) * 1.6,
        position[1] + float - (1 - e) * 0.5,
        position[2],
      ]}
      rotation={[rotation[0], rotation[1] + (1 - e) * 0.5, rotation[2]]}
      scale={interpolate(e, [0, 1], [0.5, 1])}
    >
      {/* Lifted off near-black and given some sheen: against a #0D1117 world a
          truly dark card disappears and only its lit edge survives. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.9, 1.2, 0.07]} />
        <meshStandardMaterial color="#26344A" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Lit edge — the card's only colour, so it stays a brand object. */}
      <mesh position={[-0.9, 0, 0.04]}>
        <planeGeometry args={[0.09, 1.2]} />
        <meshBasicMaterial color={edge} />
      </mesh>
      {new Array(lines).fill(0).map((_, i) => (
        <mesh key={i} position={[-0.1, 0.3 - i * 0.3, 0.037]}>
          <planeGeometry args={[1.3 - i * 0.28, 0.1]} />
          <meshBasicMaterial color="#8FA3BF" />
        </mesh>
      ))}
    </group>
  );
};

/** Phone showing the agent's reply — the product, in the frame. */
export const Phone: React.FC<{
  position?: [number, number, number];
  delay?: number;
}> = ({ position = [0, 0, 0], delay = 0 }) => {
  const frame = useCurrentFrame();
  const e = useEnter(delay);
  const float = Math.sin((frame - delay) / 26) * 0.06;

  return (
    <group
      position={[position[0], position[1] + float - (1 - e) * 1.2, position[2]]}
      rotation={[0.05, interpolate(e, [0, 1], [-0.75, -0.22]), 0]}
      scale={interpolate(e, [0, 1], [0.65, 1])}
    >
      {/* Body is a light metal, not black: on the bright ground a black slab
          reads as a hole punched in the frame rather than as a device. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 3.5, 0.14]} />
        <meshStandardMaterial color="#8E9AAB" roughness={0.22} metalness={0.85} />
      </mesh>
      {/* Light-theme screen. The phone only ever appears in the bright world,
          and a dark screen there is a black hole punched through the frame. */}
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[1.58, 3.3]} />
        <meshBasicMaterial color="#F4F7FB" />
      </mesh>
      {/* Chat bubbles: question, then the answer arriving line by line. */}
      <mesh position={[0.3, 1.15, 0.08]}>
        <planeGeometry args={[0.95, 0.32]} />
        <meshBasicMaterial color={BLUE} />
      </mesh>
      {new Array(5).fill(0).map((_, i) => {
        const on = interpolate(frame - delay, [18 + i * 6, 26 + i * 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <mesh
            key={i}
            position={[-0.28 + (1 - on) * 0.3, 0.5 - i * 0.42, 0.08]}
            scale={[on, on, 1]}
          >
            <planeGeometry args={[1.0 - i * 0.09, 0.3]} />
            <meshBasicMaterial color={i === 4 ? YELLOW : "#D7E0EC"} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Invisible floor whose only job is catching shadows.
 *
 * `shadowMaterial` rather than a painted surface: any lit material, even one
 * set to the exact background colour, still shades differently from the flat
 * backdrop and draws a hard horizon across the frame — which reads as a seam in
 * the composite rather than as a room. This renders nothing but the shadows.
 */
export const Ground: React.FC<{ opacity?: number; y?: number }> = ({
  opacity = 0.55,
  y = -3.4,
}) => (
  <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
    <planeGeometry args={[60, 60]} />
    <shadowMaterial transparent opacity={opacity} />
  </mesh>
);
