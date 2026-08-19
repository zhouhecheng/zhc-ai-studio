import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

type R2Range = { offset: number; length: number };
type UploadedPart = { partNumber: number; etag: string };

interface StoredObject {
  body: ReadableStream;
  size: number;
  etag: string;
  range?: R2Range;
  writeHttpMetadata(headers: Headers): void;
}

interface MultipartUpload {
  uploadId: string;
  uploadPart(partNumber: number, value: ReadableStream | ArrayBuffer | ArrayBufferView): Promise<UploadedPart>;
  complete(parts: UploadedPart[]): Promise<unknown>;
  abort(): Promise<void>;
}

interface MediaBucket {
  get(key: string, options?: { range?: Headers }): Promise<StoredObject | null>;
  head(key: string): Promise<Omit<StoredObject, "body"> | null>;
  createMultipartUpload(key: string, options?: { httpMetadata?: { contentType?: string } }): Promise<MultipartUpload>;
  resumeMultipartUpload(key: string, uploadId: string): MultipartUpload;
}

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
  MEDIA: MediaBucket;
  MEDIA_UPLOAD_TOKEN?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const videoNamePattern = /^[a-zA-Z0-9._-]+\.mp4$/;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function isAuthorized(request: Request, env: Env) {
  return Boolean(env.MEDIA_UPLOAD_TOKEN) && request.headers.get("authorization") === `Bearer ${env.MEDIA_UPLOAD_TOKEN}`;
}

function readVideoKey(value: string | null) {
  if (!value || !videoNamePattern.test(value)) return null;
  return value;
}

async function serveVideo(request: Request, env: Env, key: string) {
  if (request.method === "HEAD") {
    const object = await env.MEDIA.head(key);
    if (!object) return env.ASSETS.fetch(request);
    const headers = new Headers({ "accept-ranges": "bytes", "content-length": String(object.size), etag: object.etag });
    object.writeHttpMetadata(headers);
    return new Response(null, { status: 200, headers });
  }

  const object = await env.MEDIA.get(key, { range: request.headers });
  if (!object) return env.ASSETS.fetch(request);

  const headers = new Headers({ "accept-ranges": "bytes", etag: object.etag, "cache-control": "public, max-age=31536000, immutable" });
  object.writeHttpMetadata(headers);

  if (object.range) {
    const { offset, length } = object.range;
    headers.set("content-length", String(length));
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(object.size));
  return new Response(object.body, { status: 200, headers });
}

async function handleMediaUpload(request: Request, env: Env, url: URL) {
  if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
  const action = url.pathname.slice("/__media/".length);

  if (action === "init" && request.method === "POST") {
    const body = (await request.json()) as { key?: string };
    const key = readVideoKey(body.key ?? null);
    if (!key) return json({ error: "Invalid video name" }, 400);
    const upload = await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType: "video/mp4" } });
    return json({ key, uploadId: upload.uploadId });
  }

  if (action === "part" && request.method === "PUT") {
    const key = readVideoKey(url.searchParams.get("key"));
    const uploadId = url.searchParams.get("uploadId");
    const partNumber = Number(url.searchParams.get("partNumber"));
    if (!key || !uploadId || !Number.isInteger(partNumber) || partNumber < 1 || !request.body) {
      return json({ error: "Invalid multipart request" }, 400);
    }
    const part = await env.MEDIA.resumeMultipartUpload(key, uploadId).uploadPart(partNumber, request.body);
    return json(part);
  }

  if (action === "complete" && request.method === "POST") {
    const body = (await request.json()) as { key?: string; uploadId?: string; parts?: UploadedPart[] };
    const key = readVideoKey(body.key ?? null);
    if (!key || !body.uploadId || !Array.isArray(body.parts) || body.parts.length === 0) {
      return json({ error: "Invalid completion request" }, 400);
    }
    const parts = [...body.parts].sort((a, b) => a.partNumber - b.partNumber);
    await env.MEDIA.resumeMultipartUpload(key, body.uploadId).complete(parts);
    return json({ ok: true, key, parts: parts.length });
  }

  return json({ error: "Not found" }, 404);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/__media/")) return handleMediaUpload(request, env, url);

    if (url.pathname.startsWith("/works/") && url.pathname.endsWith(".mp4")) {
      const key = readVideoKey(decodeURIComponent(url.pathname.slice("/works/".length)));
      if (key && (request.method === "GET" || request.method === "HEAD")) return serveVideo(request, env, key);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path: string) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (
          body: ReadableStream,
          { width, format, quality }: { width: number; format: string; quality: number },
        ) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
