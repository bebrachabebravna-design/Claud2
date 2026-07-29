/**
 * Transcribes public/source-video.mp4 into src/captions.json using whisper.cpp.
 *
 * Requires `huggingface.co` in the environment's network egress allowlist —
 * that is where the model weights are hosted. Without it the download returns
 * a 403 from the agent proxy and whisper fails with "invalid model data
 * (bad magic)", because the 101-byte error page lands where the model should.
 *
 * Run with: node scripts/transcribe.mjs
 */
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const root = process.cwd();
const whisperDir = path.join(root, "whisper.cpp");
const wav = path.join(whisperDir, "source-audio.wav");
const model = "small";

await installWhisperCpp({ to: whisperDir, version: "1.5.5" });
await downloadWhisperModel({ model, folder: whisperDir });

const bytes = fs.statSync(path.join(whisperDir, `ggml-${model}.bin`)).size;
if (bytes < 10_000_000) {
  throw new Error(
    `Model file is only ${bytes} bytes — the download was blocked. ` +
      `Allow huggingface.co in the environment's network egress settings.`,
  );
}

execSync(
  `npx remotion ffmpeg -i ${path.join(root, "public", "source-video.mp4")} -ar 16000 -ac 1 ${wav} -y`,
  { stdio: "ignore" },
);

const whisperCppOutput = await transcribe({
  model,
  whisperPath: whisperDir,
  whisperCppVersion: "1.5.5",
  inputPath: wav,
  tokenLevelTimestamps: true,
  language: "ru",
});

const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(
  path.join(root, "src", "captions.json"),
  JSON.stringify(captions, null, 2),
);
console.log(`Wrote ${captions.length} captions to src/captions.json`);
