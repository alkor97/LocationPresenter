
import { LatLng, latLng as createLatLng } from 'leaflet';
import pixelmatch = require('pixelmatch');
import { retryPromise } from './promise-retrier';

type Pixels = number[] | Uint8ClampedArray;
export enum ImageType {
  EMPTY, ACTUAL,
}
export type ImageProvider = (type: ImageType, width: number, height: number) => HTMLImageElement;

export function isStreetViewSupportedAt(latLng: LatLng, key: string = '',
                                        imageProvider: ImageProvider = getImage): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const width = 64;
    const height = 32;
    const retries = 1;
    const timeout = 1000;

    const referencePromise = retryPromise(() => {
      const referenceImage = imageProvider(ImageType.EMPTY, width, height);
      return getPromiseOfReferenceImageWithoutStreetView(referenceImage, key);
    }, retries, timeout);

    const actualPromise = retryPromise(() => {
      const actualImage = imageProvider(ImageType.ACTUAL, width, height);
      return getPromiseOfActualStreetViewImage(latLng, actualImage, key);
    }, retries, timeout);

    Promise.all([referencePromise, actualPromise]).then((images: Pixels[]) => {
      const [emptyStreetView, actualStreetView] = images;
      const mismatchedPixels = pixelmatch(emptyStreetView, actualStreetView, undefined, width, height);
      resolve(mismatchedPixels > 0);
    }).catch((reason) => {
      reject(reason);
    });
  });
}

function getNamedPromise(promise: Promise<Pixels>, name: string, url: string): Promise<Pixels> {
  return new Promise((resolve, reject) => {
    promise.then((pixels) => {
      resolve(pixels);
    }).catch(() => {
      reject(`unable to load ${name} image ${url}`);
    });
  });
}

function getPromiseOfReferenceImageWithoutStreetView(image: HTMLImageElement, key: string): Promise<Pixels> {
  const url = getEmptyStreetViewUrl(image.width, image.height, key);
  return getNamedPromise(
    getImagePromise(url, image),
    'empty street view', url);
}

function getPromiseOfActualStreetViewImage(latLng: LatLng, image: HTMLImageElement, key: string): Promise<Pixels> {
  const url = getStreetViewUrl(latLng, image.width, image.height, key);
  return getNamedPromise(
    getImagePromise(url, image),
    'actual street view', url);
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

export function getEmptyStreetViewUrl(width: number, height: number, key: string): string {
  return getStreetViewUrl(createLatLng(0, 0), width, height, key);
}

export function getStreetViewUrl(latLng: LatLng, width: number, height: number, key: string): string {
  const auth = key ? `&key=${key}` : '';
  // tslint:disable-next-line:max-line-length
  return `http://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${latLng.lat},${latLng.lng}${auth}`;
}
