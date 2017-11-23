
import * as L from 'leaflet';
import * as D from './distance';
import { AccessibleMap, AccessibleRenderer } from './leaflet-helpers';

export const enum TextAlign {
    START = 'start', END = 'end',
}

export interface TextLayerOptions {
    textSize?: D.Distance;
    verticalOffset?: D.Distance;
    textColor?: string;
    textAlign?: TextAlign;
    readonly [key: string]: any;
}

interface WritableTextLayerOptions extends TextLayerOptions {
    textSize: D.Distance;
    verticalOffset: D.Distance;
    textColor: string;
    textAlign: TextAlign;
    [key: string]: any;
}

function textLayerOptionsDefaults(): WritableTextLayerOptions {
    return {
        textSize: D.pixels(10),
        verticalOffset: D.pixels(0),
        textColor: 'black',
        textAlign: TextAlign.START,
    };
}

class TextLayer extends L.Layer {
    private readonly text: string;
    private readonly textPathOptions = textLayerOptionsDefaults();
    private readonly from: L.LatLng;
    private readonly to: L.LatLng;
    private textNode: SVGElement;
    private map: L.Map;
    private fromP: L.Point;
    private toP: L.Point;

    constructor(from: L.LatLng, to: L.LatLng, text: string, options?: TextLayerOptions) {
        super();
        this.from = from;
        this.to = to;
        this.text = text || '';
        if (options) {
            Object.assign(this.textPathOptions, options);
        }
    }

    public onAdd(map: L.Map): this {
        this.map = map;

        const textNode = L.SVG.create('text');
        textNode.setAttribute('fill', this.textPathOptions.textColor);
        textNode.setAttribute('text-anchor', this.textPathOptions.textAlign);

        textNode.appendChild(document.createTextNode(this.text));

        this.textNode = textNode;
        this.getContainer(map).appendChild(textNode);

        map.on('zoomend viewreset', this.update, this);
        return this;
    }

    public onRemove(map: L.Map): this {
        map.off('zoomend viewreset', this.update, this);
        this.getContainer(map).removeChild(this.textNode);
        return this;
    }

    private getContainer(map: L.Map): SVGElement {
        return (map as AccessibleMap)._renderer._container;
    }

    private update(): void {
        this.projectLatLngs();
        const angle = Math.atan((this.toP.y - this.fromP.y)
            / (this.toP.x - this.fromP.x)) * 180 / Math.PI;

        const dy = this.getVerticalOffsetInPixels();
        const translate = `translate(0 ${dy})`;
        if (this.textPathOptions.textAlign === TextAlign.END) {
            this.textNode.setAttribute('x', '' + this.toP.x);
            this.textNode.setAttribute('y', '' + this.toP.y);
            this.textNode.setAttribute('transform', `rotate(${angle} ${this.toP.x} ${this.toP.y}) ${translate}`);
        } else if (this.textPathOptions.textAlign === TextAlign.START) {
            this.textNode.setAttribute('x', '' + this.fromP.x);
            this.textNode.setAttribute('y', '' + this.fromP.y);
            this.textNode.setAttribute('transform', `rotate(${angle} ${this.fromP.x} ${this.fromP.y}) ${translate}`);
        }
        this.textNode.setAttribute('font-size', '' + this.getFontSizeInPixels());
    }

    private projectDistance(distance: D.Distance): number {
        if (distance.unit === D.Unit.PIXELS) {
            return distance.value;
        } else {
            const diagInMeters = this.from.distanceTo(this.to);
            const diagInPixels = this.fromP.distanceTo(this.toP);

            return distance.to(D.Unit.METERS).value * diagInPixels / diagInMeters;
        }
    }

    private projectLatLngs(): void {
        this.fromP = this.projectPoint(this.from);
        this.toP = this.projectPoint(this.to);
    }

    private projectPoint(latLng: L.LatLngExpression): L.Point {
        return this.map.latLngToLayerPoint(latLng);
    }

    private getFontSizeInPixels(): number {
        return this.projectDistance(this.textPathOptions.textSize);
    }

    private getVerticalOffsetInPixels(): number {
        return this.projectDistance(this.textPathOptions.verticalOffset);
    }
}

export function textLayer(from: L.LatLng, to: L.LatLng, text: string, options?: TextLayerOptions): TextLayer {
    return new TextLayer(from, to, text, options);
}
