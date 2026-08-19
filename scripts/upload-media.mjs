import { open, readdir } from "node:fs/promises";
import { join } from "node:path";

const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
const token = process.env.MEDIA_UPLOAD_TOKEN;
const mediaDirectory = join(process.cwd(), "public", "works");
const chunkSize = 8 * 1024 * 1024;

if (!siteUrl || !token) throw new Error("SITE_URL and MEDIA_UPLOAD_TOKEN are required");

const authHeaders = { authorization: `Bearer ${token}` };
const videoNames = (await readdir(mediaDirectory)).filter((name) => name.toLowerCase().endsWith(".mp4")).sort();

async function expectJson(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  return data;
}

for (const key of videoNames) {
  const source = await open(join(mediaDirectory, key), "r");
  const { size } = await source.stat();
  const init = await expectJson(await fetch(`${siteUrl}/__media/init`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({ key }),
  }));

  const parts = [];
  let offset = 0;
  let partNumber = 1;

  try {
    while (offset < size) {
      const length = Math.min(chunkSize, size - offset);
      const buffer = Buffer.allocUnsafe(length);
      const { bytesRead } = await source.read(buffer, 0, length, offset);
      const part = await expectJson(await fetch(
        `${siteUrl}/__media/part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(init.uploadId)}&partNumber=${partNumber}`,
        { method: "PUT", headers: authHeaders, body: buffer.subarray(0, bytesRead) },
      ));
      parts.push(part);
      offset += bytesRead;
      partNumber += 1;
      process.stdout.write(`\r${key}: ${Math.round((offset / size) * 100)}%`);
    }

    await expectJson(await fetch(`${siteUrl}/__media/complete`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ key, uploadId: init.uploadId, parts }),
    }));
    process.stdout.write(`\r${key}: uploaded\n`);
  } finally {
    await source.close();
  }
}
