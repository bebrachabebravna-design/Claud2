import { Composition } from "remotion";
import { DUR_FRAMES, Reel1, Reel2, Reel3 } from "./Reels20";
import { DeepTest } from "./DeepTest";
import { VariantA, VariantB, VariantC } from "./Variants";
import { ReelEdit } from "./ReelEdit";
import { ReelEdit2 } from "./ReelEdit2";
import { DURATION_SECONDS, FPS } from "./captions-data";
import {
  DURATION_SECONDS as DUR2,
  FPS as FPS2,
} from "./captions-data2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {[
        { id: "Reel1", component: Reel1 },
        { id: "Reel2", component: Reel2 },
        { id: "Reel3", component: Reel3 },
      ].map((r) => (
        <Composition
          key={r.id}
          id={r.id}
          component={r.component}
          durationInFrames={DUR_FRAMES}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
      <Composition
        id="VariantA"
        component={VariantA}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VariantB"
        component={VariantB}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VariantC"
        component={VariantC}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeepTest"
        component={DeepTest}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReelEdit2"
        component={ReelEdit2}
        durationInFrames={Math.round(DUR2 * FPS2)}
        fps={FPS2}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReelEdit"
        component={ReelEdit}
        durationInFrames={Math.round(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
