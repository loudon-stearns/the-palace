// A caption card lit word by word as Kokoro speaks, 2026-11-15. The narration starts at LEAD_FRAMES inside a
// <Sequence>; each word lights at LEAD + its start in narration.json (Kokoro's own timings), so the eye can check
// the ear. Graphite tokens from the Loudon Live Design System, as named constants.
// A maker who can do this better another way should; leave the comparison on the scroll.
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Audio as MediaAudio } from "@remotion/media";
import narration from "../public/narration.json";

const BG = "#0a0a0f", INK = "#e8e8f0", DIM = "#3a3a48", AMBER = "#e8b84a";
export const FPS = 30;
export const LEAD_FRAMES = 15;                       // narration starts at 0.5 s
export const DURATION_FRAMES = LEAD_FRAMES + Math.ceil((narration.audio_sec + 1.0) * FPS);
type Word = { w: string; start: number; end: number };
// punctuation tokens ride on the word before them
const words: Word[] = narration.words.reduce((acc: Word[], w: Word) => {
  if (/\w/.test(w.w) || acc.length === 0) acc.push({ ...w }); else acc[acc.length - 1].w += w.w;
  return acc;
}, []);

export const Caption: React.FC<{ audio: "html5" | "media" }> = ({ audio }) => {
  const frame = useCurrentFrame();
  const t = (frame - LEAD_FRAMES) / FPS;               // seconds into the narration
  const src = staticFile("narration.wav");
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", padding: "0 160px" }}>
      <Sequence from={LEAD_FRAMES} layout="none">
        {audio === "media" ? <MediaAudio src={src} /> : <Html5Audio src={src} />}
      </Sequence>
      <div style={{ fontFamily: "Manrope, Helvetica, sans-serif", fontSize: 72, lineHeight: 1.3, fontWeight: 600 }}>
        {words.map((w: { w: string; start: number; end: number }, i: number) => {
          const on = t >= w.start;
          const speaking = on && t < w.end;
          return (
            <span key={i} style={{ color: speaking ? AMBER : on ? INK : DIM,
              opacity: on ? 1 : interpolate(t, [w.start - 0.6, w.start], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              {w.w}{" "}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 160, bottom: 80, fontFamily: "JetBrains Mono, monospace", fontSize: 24, color: "#8a8aa0" }}>
        remotion · {audio === "media" ? "@remotion/media Audio" : "Html5Audio"} · frame {frame}
      </div>
    </AbsoluteFill>
  );
};
