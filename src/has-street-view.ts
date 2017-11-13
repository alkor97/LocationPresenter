
import { LatLng, latLng as createLatLng } from 'leaflet';
import pixelmatch = require('pixelmatch');

type Pixels = number[] | Uint8ClampedArray;

export function isStreetViewSupportedAt(latLng: LatLng): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const width = 64;
    const height = 32;

    const referenceImage = getImage(width, height);
    const referencePromise = getPromiseOfReferenceImageWithoutStreetView(referenceImage);

    const actualImage = getImage(width, height);
    const actualPromise = getPromiseOfActualStreetViewImage(latLng, actualImage);

    referencePromise.catch((reason) => {
      reject(`unable to load image of empty street view (${reason})`);
    });
    actualPromise.catch((reason) => {
      reject(`unable to load image of street view (${reason})`);
    });

    Promise.all([referencePromise, actualPromise]).then((images: Pixels[]) => {
      const [emptyStreetView, actualStreetView] = images;
      const mismatchedPixels = pixelmatch(emptyStreetView, actualStreetView, undefined, width, height);
      resolve(mismatchedPixels > 0);
    }).catch((reason) => {
      reject(`unable to street view load images (${reason})`);
    });
  });
}

function getPromiseOfReferenceImageWithoutStreetView(image: HTMLImageElement): Promise<Pixels> {
  return getImagePromise(getEmptyStreetViewUrl(image.width, image.height), image);
}

function getPromiseOfActualStreetViewImage(latLng: LatLng, image: HTMLImageElement): Promise<Pixels> {
  return getImagePromise(getStreetViewUrl(latLng, image.width, image.height), image);
}

function getImage(width: number, height: number): HTMLImageElement {
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
    image.addEventListener('error', (reason) => {
      reject(`unable to load image ${src} (${reason})`);
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
