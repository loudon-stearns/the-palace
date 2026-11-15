import { Composition } from "remotion";
import { Caption, FPS, DURATION_FRAMES } from "./Caption";

// One composition, two audio paths: `html5` is remotion's Html5Audio (the old <Audio>, now a deprecated alias),
// `media` is @remotion/media's Audio (the newer WebCodecs path). Pick with --props='{"audio":"media"}'.
export const Root: React.FC = () => (
  <Composition id="Caption" component={Caption} durationInFrames={DURATION_FRAMES} fps={FPS}
    width={1920} height={1080} defaultProps={{ audio: "html5" as "html5" | "media" }} />
);
