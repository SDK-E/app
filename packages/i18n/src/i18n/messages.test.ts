import { readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadMessages, messageShardPaths, mergeMessages } from "./messages";

async function findJsonFiles(directory: string, root = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findJsonFiles(entryPath, root);
      }
      return entry.name.endsWith(".json") ? [path.relative(root, entryPath)] : [];
    })
  );

  return files.flat().sort();
}

describe("message shards", () => {
  it("keeps the runtime loader aligned with the English catalog", async () => {
    const englishDirectory = path.join(import.meta.dirname, "..", "locales", "en");

    await expect(findJsonFiles(englishDirectory)).resolves.toEqual([...messageShardPaths].sort());
  });

  it("deep-merges namespaces while replacing leaf values and arrays", () => {
    expect(
      mergeMessages(
        { legal: { privacy: { title: "Privacy", items: ["one"] } } },
        { legal: { privacy: { title: "Confidentialité", items: ["un"] } } }
      )
    ).toEqual({
      legal: {
        privacy: { title: "Confidentialité", items: ["un"] },
      },
    });
  });

  it("loads and assembles every English namespace", async () => {
    const messages = await loadMessages("en");

    expect(Object.keys(messages)).toEqual(
      expect.arrayContaining(["meta", "nav", "homePage", "legal", "servicesPage", "enquiry"])
    );
    expect(messages).toHaveProperty("legal.privacy.title", "Privacy policy");
  });
});
