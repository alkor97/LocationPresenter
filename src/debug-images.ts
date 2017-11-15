import * as L from 'leaflet';
import { getEmptyStreetViewUrl, getStreetViewUrl } from './has-street-view';

export class DebugImages extends L.Control {
  private location: L.LatLng;
  private readonly width = 64;
  private readonly height = 32;
  public withLocation(location: L.LatLng): DebugImages {
    this.location = location;
    return this;
  }
  public onAdd(map: L.Map): HTMLElement {
    const div = L.DomUtil.create('div');
    div.appendChild(this.createImage('empty', getEmptyStreetViewUrl(this.width, this.height)));
    div.appendChild(this.createImage('actual', getStreetViewUrl(this.location, this.width, this.height)));
    return div;
  }
  private createImage(id: string, src: string): HTMLImageElement {
    const image = L.DomUtil.create('img') as HTMLImageElement;
    image.id = id;
    image.alt = id;
    image.src = src;
    image.style.display = 'block';
    return image;
  }
}
