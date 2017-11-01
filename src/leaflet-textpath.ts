
import * as L from 'leaflet';

export const enum TextAlign {
  LEFT, RIGHT,
}

export const enum DistanceUnit {
  PIXELS = 'px',
  METERS = 'm',
  KILOMETERS = 'km',
}

export type Distance = [number, string | DistanceUnit];

export interface TextPathOptions {
  size?: Distance;
  verticalOffset?: Distance;
  color?: string;
  align?: TextAlign;
  readonly [key: string]: any;
}

interface WritableTextPathOptions extends TextPathOptions {
  size: Distance;
  verticalOffset: Distance;
  color: string;
  align: TextAlign;
  [key: string]: any;
}

const textPathOptionsDefaults: WritableTextPathOptions = {
  size: [10, DistanceUnit.PIXELS],
  verticalOffset: [0, DistanceUnit.PIXELS],
  color: 'black',
  align: TextAlign.LEFT,
};

interface AccessibleRenderer extends L.Renderer {
  _container: SVGElement;
  _updatePoly(layer: L.Layer): void;
}

interface AccessibleMap extends L.Map {
  _renderer: AccessibleRenderer;
}

export function parseDistance(distance: number | string): Distance {
  const result: Distance = [0, DistanceUnit.PIXELS];
  if (typeof distance === 'string') {
    const match = distance.toLowerCase().match(/^(\d+)\s*(.*)/);
    if (match) {
      switch (match[2]) {
        case 'm': result[1] = DistanceUnit.METERS; break;
        case 'km': result[1] = DistanceUnit.KILOMETERS; break;
      }
      result[0] = parseFloat(match[1]);
    }
  }
  return result;
}

export class TextPath extends L.Polyline {
  private text: string;
  private textPathOptions = textPathOptionsDefaults;
  private textNode: SVGElement;

  // private interface of Path
  /* tslint:disable: variable-name */
  private _renderer: AccessibleRenderer;
  private _map: AccessibleMap;
  private _path: SVGElement;
  /* tslint:enable: variable-name */

  constructor(latLngs: L.LatLngExpression[], text: string, options?: TextPathOptions) {
    super(latLngs, {
      noClip: true,
      stroke: false,
    });
    this.text = text || '';
    if (options) {
      Object.assign(this.textPathOptions, options);
    }
  }

  // private interface of Polyline
  protected _updatePath(): void {
    this.updatePoly();

    if (!this.textNode) {
      const id = 'pathdef-' + L.Util.stamp(this);
      this.getPathNode().setAttribute('id', id);

      const svgTextPath = L.SVG.create('textPath');
      svgTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
      svgTextPath.appendChild(document.createTextNode(this.text));

      const textNode = L.SVG.create('text');
      textNode.setAttribute('fill', this.textPathOptions.color);
      textNode.appendChild(svgTextPath);
      this.textNode = textNode;

      this.getSvgElement().appendChild(textNode);
    }

    this.textNode.setAttribute('font-size', this.getFontSizeInPixels());
    this.textNode.setAttribute('dy', this.getVerticalOffsetInPixels());

    const align = this.textPathOptions.align;
    if (align === TextAlign.RIGHT) {
      const textWidth = (this.textNode as SVGTextElement).getBBox().width;
      const pathWidth = this.getPathNode().getBoundingClientRect().width;
      this.textNode.setAttribute('dx', '' + (pathWidth - textWidth));
    }
  }

  protected getPathNode(): SVGElement {
    return this._path;
  }

  protected updatePoly(): void {
    this._renderer._updatePoly(this);
  }

  protected getSvgElement(): SVGElement {
    return this.getMap()._renderer._container;
  }

  protected getMap(): AccessibleMap {
    return this._map;
  }

  private projectDistance(distance: Distance): number {
    const [value, unit] = distance;
    if (unit === DistanceUnit.PIXELS) {
      return value;
    } else {
      const modifier = unit === DistanceUnit.KILOMETERS ? 1000 : 1;

      const sw = this.getBounds().getSouthWest();
      const nw = L.latLng(sw.lat + 1, sw.lng);
      const oneDegreeInMeters = sw.distanceTo(nw);

      const swp = this.getMap().latLngToLayerPoint(sw);
      const nwp = this.getMap().latLngToLayerPoint(nw);
      const oneDegreeInPixels = Math.abs(nwp.y - swp.y);

      return modifier * value * oneDegreeInPixels / oneDegreeInMeters;
    }
  }

  private getFontSizeInPixels(): string {
    return '' + this.projectDistance(this.textPathOptions.size);
  }

  private getVerticalOffsetInPixels(): string {
    return '' + this.projectDistance(this.textPathOptions.verticalOffset);
  }
}

export function textPath(latLngs: L.LatLng[], text: string, options?: TextPathOptions): TextPath {
  return new TextPath(latLngs, text, options);
}
