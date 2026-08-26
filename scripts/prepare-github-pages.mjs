import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const outputRoot = resolve("dist-github");

await mkdir(resolve(outputRoot, "works"), { recursive: true });
await cp(resolve("public", "zhc-studio-bg.png"), resolve(outputRoot, "zhc-studio-bg.png"));
await cp(resolve("public", "zhc-studio-bg-cloudscape.png"), resolve(outputRoot, "zhc-studio-bg-cloudscape.png"));
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
    const protectedPaths = current
      .replaceAll("/zhc-ai-studio/fonts/", "__ZHC_FONTS__")
      .replaceAll("/zhc-ai-studio/works/posters/", "__ZHC_POSTERS__")
      .replaceAll("/zhc-ai-studio/zhc-studio-bg.png", "__ZHC_BACKGROUND__")
      .replaceAll("/zhc-ai-studio/zhc-studio-bg-cloudscape.png", "__ZHC_CLOUDSCAPE__")
      .replaceAll("/zhc-ai-studio/og.png", "__ZHC_OG__");

    const updated = protectedPaths
      .replaceAll("/fonts/", "/zhc-ai-studio/fonts/")
      .replaceAll("/works/posters/", "/zhc-ai-studio/works/posters/")
      .replaceAll("/zhc-studio-bg.png", "/zhc-ai-studio/zhc-studio-bg.png")
      .replaceAll("/zhc-studio-bg-cloudscape.png", "/zhc-ai-studio/zhc-studio-bg-cloudscape.png")
      .replaceAll("/og.png", "/zhc-ai-studio/og.png")
      .replaceAll("__ZHC_FONTS__", "/zhc-ai-studio/fonts/")
      .replaceAll("__ZHC_POSTERS__", "/zhc-ai-studio/works/posters/")
      .replaceAll("__ZHC_BACKGROUND__", "/zhc-ai-studio/zhc-studio-bg.png")
      .replaceAll("__ZHC_CLOUDSCAPE__", "/zhc-ai-studio/zhc-studio-bg-cloudscape.png")
      .replaceAll("__ZHC_OG__", "/zhc-ai-studio/og.png");

    if (updated !== current) await writeFile(target, updated, "utf8");
  }
}

await prefixStaticPaths(outputRoot);
await writeFile(resolve(outputRoot, ".nojekyll"), "", "utf8");
await cp(resolve(outputRoot, "index.html"), resolve(outputRoot, "404.html"));
