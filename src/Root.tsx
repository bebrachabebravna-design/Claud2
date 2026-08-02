import { Composition } from "remotion";
import { ShortEdit } from "./ShortEdit";
import { ReelEdit } from "./ReelEdit";
import { DURATION_SECONDS, FPS } from "./captions-data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReelEdit"
        component={ReelEdit}
        durationInFrames={Math.round(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShortEdit"
        component={ShortEdit}
        durationInFrames={1644}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
