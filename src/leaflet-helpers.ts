
import * as L from 'leaflet';
import * as D from './distance';

export interface AccessibleRenderer extends L.Renderer {
    _container: SVGElement;
    _updatePoly(layer: L.Layer): void;
}

export interface AccessibleMap extends L.Map {
    _renderer: AccessibleRenderer;
}

export function calculateEndPoint(latlng: L.LatLng, dist: D.Distance, degree: number): L.LatLng {
    /*
     * http://www.codeguru.com/cpp/cpp/algorithms/article.php/c5115/Geographic-Distance-and-Azimuth-Calculations.htm
     */

    const d2r = (Math.PI / 180); // degree 2 radius
    const r2d = (180 / Math.PI);
    const R = D.kilometers(6378.137); // earth radius
    const bearing = degree * d2r;

    const distance = dist.to(D.Unit.KILOMETERS).value / R.value;
    const a = Math.acos(Math.cos(distance) *
        Math.cos((90 - latlng.lat) * d2r) +
        Math.sin((90 - latlng.lat) * d2r) *
        Math.sin(distance) *
        Math.cos(bearing));
    const B = Math.asin(Math.sin(distance) * Math.sin(bearing) / Math.sin(a));
    return new L.LatLng(90 - a * r2d, B * r2d + latlng.lng);
}
