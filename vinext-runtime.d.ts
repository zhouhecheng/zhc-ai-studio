declare module "vinext" {
  const vinext: (...args: unknown[]) => any;
  export default vinext;
}

declare module "vinext/server/image-optimization" {
  export const DEFAULT_DEVICE_SIZES: number[];
  export const DEFAULT_IMAGE_SIZES: number[];
  export const handleImageOptimization: (...args: unknown[]) => Promise<Response>;
}

declare module "vinext/server/app-router-entry" {
  const handler: {
    fetch(request: Request, env: unknown, ctx: unknown): Promise<Response>;
  };
  export default handler;
}
