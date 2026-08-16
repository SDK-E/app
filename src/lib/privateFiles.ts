import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { del, get, put } from "@vercel/blob";

import { getServerEnv } from "@/lib/env";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Map([
  ["application/pdf", new Set([".pdf"])],
  ["image/jpeg", new Set([".jpg", ".jpeg"])],
  ["image/png", new Set([".png"])],
]);

function token(): string {
  const value = getServerEnv().BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error("BLOB_READ_WRITE_TOKEN is required for private-file operations.");
  return value;
}

export function validatePrivateFile(file: Pick<File, "name" | "type" | "size">): void {
  const extensions = allowedTypes.get(file.type);
  if (!extensions || !extensions.has(extname(file.name).toLowerCase())) throw new Error("Upload a PDF, JPEG, or PNG file with a matching extension.");
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) throw new Error("Files must be between 1 byte and 10 MB.");
}

export async function storePrivateFile(scope: "provider-document" | "provider-invoice" | "form-response", ownerId: string, file: File) {
  validatePrivateFile(file);
  const extension = extname(file.name).toLowerCase();
  const pathname = `${scope}/${ownerId}/${randomUUID()}${extension}`;
  const blob = await put(pathname, file, { access: "private", addRandomSuffix: false, token: token() });
  return { storageKey: blob.pathname, sizeBytes: file.size, mimeType: file.type, originalName: file.name };
}

export async function readPrivateFile(storageKey: string) {
  const blob = await get(storageKey, { access: "private", token: token() });
  if (!blob) throw new Error("The requested file is unavailable.");
  return blob;
}

export async function deletePrivateFile(storageKey: string): Promise<void> {
  await del(storageKey, { token: token() });
}
