import { Composition } from "remotion";
import { ShortEdit } from "./ShortEdit";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortEdit"
      component={ShortEdit}
      durationInFrames={1644}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
