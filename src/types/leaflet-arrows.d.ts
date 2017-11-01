import * as L from 'leaflet';

declare module 'leaflet' {

  export interface ArrowData {
    latlng: L.LatLng;
    degree: number;
    distance: number;
  }

  export interface ArrowOptions {
    distanceUnit?: string;
    stretchFactor?: number;
    arrowheadLength?: number;
    arrowheadClosingLine?: boolean;
    arrowheadDegree?: number;
    clickableWidth?: number;
    circleRadiusInvalidPoint?: number;
    color?: string;
    opacity?: number;
    fillOpacity?: number;
    weight?: number;
    smoothFactor?: number;
    radius?: number;
  }

  export class Arrow extends L.FeatureGroup {
    constructor(data?: ArrowData, options?: ArrowOptions);
    public _calculateEndPoint(latLng: L.LatLng, distance: number, degree: number): L.LatLng;
    protected initialize(data?: ArrowData, options?: ArrowOptions): void;
  }
}
