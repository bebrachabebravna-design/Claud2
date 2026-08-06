import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CYAN } from "../fonts";

/**
 * The grounds the speaker is composited onto.
 *
 * `dark` and `light` replace the room entirely; `overlay` keeps the original
 * take visible and drops the props into it. Alternating dark and light is the
 * strongest attention device in the reference edit — the eye has to re-adapt on
 * every swap, which reads as pace without cutting faster. All three share one
 * camera move, so a swap feels like the same space changing rather than two
 * unrelated templates butted together.
 */
export type WorldMode = "dark" | "light" | "overlay";

const GROUNDS: Record<WorldMode, string | undefined> = {
  dark: "#0D1117",
  light: "#EEF2F7",
  overlay: undefined,
};

export const World: React.FC<{
  mode: WorldMode;
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ mode, children, durationInFrames }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / Math.max(durationInFrames, 1);

  // Shared dolly: a slow push with a lateral drift, so nothing is ever static.
  const camera = {
    fov: 46,
    position: [
      Math.sin(t * Math.PI * 0.9) * 0.55,
      interpolate(t, [0, 1], [0.35, -0.1]),
      interpolate(t, [0, 1], [7.4, 6.5]),
    ] as [number, number, number],
  };

  const light = mode === "light";

  return (
    <ThreeCanvas
      linear
      width={width}
      height={height}
      shadows
      camera={camera}
      style={{ backgroundColor: GROUNDS[mode] ?? "transparent" }}
    >
      <ambientLight intensity={light ? 1.5 : 0.55} />
      {/* Key from camera-left, matching how the take itself is lit. */}
      <directionalLight
        castShadow
        position={light ? [-4, 7, 6] : [-5, 6, 5]}
        intensity={light ? 2.6 : 2.4}
        shadow-mapSize={[1024, 1024]}
      />
      {light ? (
        <directionalLight position={[6, 2, 4]} intensity={0.9} color="#CFE6FF" />
      ) : (
        <>
          {/* Cyan rim from the right — the lamp the edit asks to be on set. */}
          <pointLight position={[5.5, 1.5, 2]} intensity={45} color={CYAN} distance={22} />
          <pointLight position={[-4, -2, 3]} intensity={18} color="#1E5FFF" distance={18} />
        </>
      )}
      {mode === "dark" ? <fog attach="fog" args={["#0D1117", 9, 20]} /> : null}
      {children}
    </ThreeCanvas>
  );
};
