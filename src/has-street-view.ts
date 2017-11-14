
import { LatLng, latLng as createLatLng } from 'leaflet';
import pixelmatch = require('pixelmatch');
import { retryPromise } from './promise-retrier';

type Pixels = number[] | Uint8ClampedArray;
export enum ImageType {
  EMPTY, ACTUAL,
}
export type ImageProvider = (type: ImageType, width: number, height: number) => HTMLImageElement;

export function isStreetViewSupportedAt(latLng: LatLng, imageProvider: ImageProvider = getImage): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const width = 64;
    const height = 32;
    const retries = 4;
    const timeout = 1000;

    const referenceImage = imageProvider(ImageType.EMPTY, width, height);
    const referencePromise = retryPromise(() => getPromiseOfReferenceImageWithoutStreetView(referenceImage),
      retries, timeout);

    const actualImage = imageProvider(ImageType.ACTUAL, width, height);
    const actualPromise = retryPromise(() => getPromiseOfActualStreetViewImage(latLng, actualImage),
      retries, timeout);

    Promise.all([referencePromise, actualPromise]).then((images: Pixels[]) => {
      const [emptyStreetView, actualStreetView] = images;
      const mismatchedPixels = pixelmatch(emptyStreetView, actualStreetView, undefined, width, height);
      resolve(mismatchedPixels > 0);
    }).catch((reason) => {
      reject(reason);
    });
  });
}

function getNamedPromise(promise: Promise<Pixels>, name: string): Promise<Pixels> {
  return new Promise((resolve, reject) => {
    promise.then((pixels) => {
      resolve(pixels);
    }).catch((reason) => {
      reject(`unable to load ${name} image`);
    });
  });
}

function getPromiseOfReferenceImageWithoutStreetView(image: HTMLImageElement): Promise<Pixels> {
  return getNamedPromise(
    getImagePromise(
      getEmptyStreetViewUrl(image.width, image.height), image),
      'empty street view');
}

function getPromiseOfActualStreetViewImage(latLng: LatLng, image: HTMLImageElement): Promise<Pixels> {
  return getNamedPromise(
    getImagePromise(
      getStreetViewUrl(latLng, image.width, image.height), image),
      'actual street view');
}

function getImage(imageType: ImageType, width: number, height: number): HTMLImageElement {
  return new Image(width, height);
}

function getImagePromise(src: string, image: HTMLImageElement): Promise<Pixels> {
  return new Promise((resolve, reject) => {
    image.crossOrigin = 'Anonymous';
    image.addEventListener('load', () => {
      if (image.naturalWidth + image.naturalHeight > 0) {
        getPixelsPromise(image).then((pixels: Pixels) => {
          resolve(pixels);
        }).catch((reason) => {
          reject(`unable to get pixels of image ${src} (${reason})`);
        });
      } else {
        reject(`unable to load image ${src} (no data)`);
      }
    });
    image.addEventListener('error', () => {
      reject(`unable to load image ${src}`);
    });
    image.src = src;
  });
}

function getPixelsPromise(image: HTMLImageElement): Promise<Pixels> {
  return new Promise((resolve, reject) => {
    const width = image.width;
    const height = image.height;

    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(image, 0, 0, width, height);
      resolve(context.getImageData(0, 0, width, height).data);
    } else {
      reject('no context');
    }
  });
}

function getEmptyStreetViewUrl(width: number, height: number): string {
  return getStreetViewUrl(createLatLng(0, 0), width, height);
}

function getStreetViewUrl(latLng: LatLng, width: number, height: number): string {
  return `http://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${latLng.lat},${latLng.lng}`;
}
