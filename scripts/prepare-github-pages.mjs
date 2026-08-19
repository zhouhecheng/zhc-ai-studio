import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const outputRoot = resolve("dist-github");

await mkdir(resolve(outputRoot, "works"), { recursive: true });
await cp(resolve("public", "zhc-studio-bg.png"), resolve(outputRoot, "zhc-studio-bg.png"));
await cp(resolve("public", "og.png"), resolve(outputRoot, "og.png"));
await cp(resolve("public", "fonts"), resolve(outputRoot, "fonts"), { recursive: true });
await cp(resolve("public", "works", "posters"), resolve(outputRoot, "works", "posters"), { recursive: true });

const textExtensions = new Set([".html", ".css", ".js", ".json"]);

async function prefixStaticPaths(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await prefixStaticPaths(target);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;

    const current = await readFile(target, "utf8");
    const updated = current
      .replaceAll("/fonts/", "/zhc-ai-studio/fonts/")
      .replaceAll("/works/posters/", "/zhc-ai-studio/works/posters/")
      .replaceAll("/zhc-studio-bg.png", "/zhc-ai-studio/zhc-studio-bg.png")
      .replaceAll("/og.png", "/zhc-ai-studio/og.png");

    if (updated !== current) await writeFile(target, updated, "utf8");
  }
}

await prefixStaticPaths(outputRoot);
await writeFile(resolve(outputRoot, ".nojekyll"), "", "utf8");
await cp(resolve(outputRoot, "index.html"), resolve(outputRoot, "404.html"));
