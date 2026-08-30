import { stripBackground } from "./remove-background-core.js";

function usage(): never {
  console.error(
    "Usage: npm run bg:remove -- <image> [image...] [--border-tolerance <n>] [--uniform-tolerance <n>]\n\n" +
      "Removes a flat, uniform background from raster images in place by flood-filling\n" +
      "from the borders, then clearing any remaining near-background pixels.\n" +
      "Supported outputs: .png, .webp, .avif, .tiff, .gif (formats with an alpha channel).",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const files: string[] = [];
let borderTolerance: number | undefined;
let uniformTolerance: number | undefined;

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--border-tolerance") {
    const value = Number(args[index + 1]);
    if (!Number.isFinite(value)) usage();
    borderTolerance = value;
    index += 1;
  } else if (argument === "--uniform-tolerance") {
    const value = Number(args[index + 1]);
    if (!Number.isFinite(value)) usage();
    uniformTolerance = value;
    index += 1;
  } else if (argument.startsWith("--")) {
    usage();
  } else {
    files.push(argument);
  }
}

if (files.length === 0) usage();

let failures = 0;
for (const file of files) {
  try {
    const result = await stripBackground(file, { borderTolerance, uniformTolerance });
    const percent = ((result.removedPixels / result.totalPixels) * 100).toFixed(1);
    console.log(
      `${file}: ${result.width}x${result.height} ` +
        `background rgb(${result.background.join(", ")}) → ` +
        `${result.removedPixels}/${result.totalPixels} px (${percent}%) made transparent`,
    );
  } catch (error) {
    failures += 1;
    console.error(`${file}: ${(error as Error).message}`);
  }
}

process.exit(failures > 0 ? 1 : 0);
