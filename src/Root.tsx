import { Composition } from "remotion";
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
