
declare module 'pixelmatch' {
  type Pixels = number[] | Uint8ClampedArray;

  function pixelmatch(
    img1: Pixels,
    img2: Pixels,
    output: Pixels | undefined,
    width: number,
    height: number,
    options?: PixelMatchOptions): number;

  interface PixelMatchOptions {
    threshold?: number;
    includeAA?: boolean;
  }
  export = pixelmatch;
}
