import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const distRoot = resolve("dist");

async function removeVideos(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) await removeVideos(target);
    else if (entry.name.toLowerCase().endsWith(".mp4")) await rm(target);
  }
}

await removeVideos(distRoot);
