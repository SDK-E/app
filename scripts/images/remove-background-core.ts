import { writeFile } from "node:fs/promises";
import { extname } from "node:path";

import sharp from "sharp";

export const DEFAULT_BORDER_TOLERANCE = 32;
export const DEFAULT_UNIFORM_TOLERANCE = 12;

const ALPHA_CAPABLE_EXTENSIONS = new Set([".png", ".webp", ".avif", ".tiff", ".tif", ".gif"]);

export interface StripBackgroundOptions {
  borderTolerance?: number;
  uniformTolerance?: number;
}

export interface StripBackgroundResult {
  width: number;
  height: number;
  background: readonly [number, number, number];
  removedPixels: number;
  totalPixels: number;
}

type Rgb = readonly [number, number, number];

export function alphaCapableExtensions(): string[] {
  return [...ALPHA_CAPABLE_EXTENSIONS];
}

export function assertAlphaCapable(file: string): void {
  if (!ALPHA_CAPABLE_EXTENSIONS.has(extname(file).toLowerCase())) {
    throw new Error(
      `${file}: format does not support transparency — write to ${alphaCapableExtensions().join(", ")}`
    );
  }
}

function distance(a: Rgb, b: Rgb): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export async function stripBackground(
  file: string,
  options: StripBackgroundOptions = {}
): Promise<StripBackgroundResult> {
  assertAlphaCapable(file);
  const borderTolerance = options.borderTolerance ?? DEFAULT_BORDER_TOLERANCE;
  const uniformTolerance = options.uniformTolerance ?? DEFAULT_UNIFORM_TOLERANCE;

  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = new Uint8ClampedArray(data);

  const colorAt = (index: number): Rgb => [pixels[index], pixels[index + 1], pixels[index + 2]];

  const borderIndexes: number[] = [];
  for (let x = 0; x < width; x += 1) {
    borderIndexes.push(x * channels, ((height - 1) * width + x) * channels);
  }
  for (let y = 0; y < height; y += 1) {
    borderIndexes.push(y * width * channels, (y * width + width - 1) * channels);
  }
  const background = colorAt(borderIndexes[0]);

  const transparent = new Uint8Array(width * height);
  const queue: number[] = [];
  for (const index of borderIndexes) {
    if (distance(colorAt(index), background) <= borderTolerance) {
      const pixel = index / channels;
      if (!transparent[pixel]) {
        transparent[pixel] = 1;
        queue.push(index);
      }
    }
  }
  while (queue.length > 0) {
    const index = queue.pop() as number;
    const x = (index / channels) % width;
    const y = Math.floor(index / channels / width);
    const neighbours = [
      x > 0 ? index - channels : -1,
      x < width - 1 ? index + channels : -1,
      y > 0 ? index - width * channels : -1,
      y < height - 1 ? index + width * channels : -1,
    ];
    for (const neighbour of neighbours) {
      if (neighbour < 0) continue;
      const pixel = neighbour / channels;
      if (!transparent[pixel] && distance(colorAt(neighbour), background) <= borderTolerance) {
        transparent[pixel] = 1;
        queue.push(neighbour);
      }
    }
  }

  let removed = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const index = pixel * channels;
    const isBackground =
      transparent[pixel] === 1 || distance(colorAt(index), background) <= uniformTolerance;
    if (isBackground) {
      pixels[index + 3] = 0;
      removed += 1;
    }
  }

  await sharp(pixels, { raw: { width, height, channels } }).toFile(file);

  return {
    width,
    height,
    background,
    removedPixels: removed,
    totalPixels: width * height,
  };
}
