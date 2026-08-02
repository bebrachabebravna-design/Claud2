import { Composition } from "remotion";
import { ReelEdit } from "./ReelEdit";
import { DURATION_SECONDS, FPS } from "./captions-data";

export const RemotionRoot: React.FC = () => {
  return (
      <Composition
        id="ReelEdit"
        component={ReelEdit}
        durationInFrames={Math.round(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
  );
};
