import * as L from 'leaflet';
import 'leaflet-arrows';
import './assets';
import { isStreetViewSupportedAt } from './has-street-view';
import * as LT from './leaflet-textpath';
import { ParsedQuery, parseQuery, Query } from './query-parser';

function preparePopup(q: Query): string {
  const withStreetView = q.hasStreetView ? 'inline' : 'none';
  const prefix = 'http://maps.google.com/maps?q=&layer=c&cbll=';
  return `<b>${q.name}</b><br>
          <sup><i>${q.phone}</i></sup>
          <div><a style='display: ${withStreetView}'
            href='${prefix}${q.lat},${q.lng}&cbp=11,${q.bearing},0,0,0' target='_blank'>
            <img src="img/eye.png" width="16" height="16"/>
          </a></div>`;
}

function locationSet(map: L.Map, query: Query, point: L.LatLng) {
  const popup = () => {
    return preparePopup(query);
  };

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const circle = L.circle(point, {
    opacity: 0.0,
    fillColor: 'red',
    fillOpacity: 0.25,
    radius: query.radius,
  }).addTo(map);
  circle.bindPopup(popup);
  map.flyToBounds(circle.getBounds());

  const marker = L.marker(point).addTo(map);
  marker.bindPopup(popup);

  if (query.bearing || query.bearing === 0) {
    // workaround: if arrow angle is 0 then line rendering is discarded;
    // replacing it with 360 degrees resolves the problem
    const arrowAngle = query.bearing === 0 ? 360 : query.bearing;
    const color = '#3388ff';
    const arrowWeight = 3;

    // show bearing arrow
    const arrow = new L.Arrow({
      latlng: point,
      degree: arrowAngle,
      distance: query.radius / 1000,
    }, {
        distanceUnit: 'km',
        arrowheadLength: 0.05 * query.radius / 1000,
        color,
        weight: arrowWeight,
      }).addTo(map);

    const textSize: [number, string] = [query.radius / 10, 'm'];
    const verticalOffset: [number, string] = query.bearing < 90 || query.bearing > 270 ? [0, 'px'] : textSize;

    const infoPoint = arrow._calculateEndPoint(point, 1.01 * query.radius / 1000, query.bearing);
    const approxTextLength = 1;

    let infoPointStart = infoPoint;
    let infoPointEnd = infoPoint;
    let align = LT.TextAlign.LEFT;

    if (query.bearing < 180) {
      infoPointEnd = L.latLng(infoPoint.lat, infoPoint.lng + approxTextLength);
      align = LT.TextAlign.LEFT;
    } else {
      infoPointStart = L.latLng(infoPoint.lat, infoPoint.lng - approxTextLength);
      align = LT.TextAlign.RIGHT;
    }

    // show location radius
    LT.textPath([infoPointStart, infoPointEnd], query.radius + ' m', {
      color,
      size: textSize,
      verticalOffset,
      align,
    }).addTo(map);

    let bearingPath;
    let speedPath;
    if (query.bearing < 180) {
      const arrowEndPoint = arrow._calculateEndPoint(point, 0.95 * query.radius / 1000, query.bearing);
      const bearingPoint = arrow._calculateEndPoint(point, 0.85 * query.radius / 1000, query.bearing);
      const speedPoint = arrow._calculateEndPoint(point, 0.75 * query.radius / 1000, query.bearing);
      bearingPath = [bearingPoint, arrowEndPoint];
      speedPath = [speedPoint, arrowEndPoint];
    } else {
      const bearingPoint = arrow._calculateEndPoint(point, 0.95 * query.radius / 1000, query.bearing);
      bearingPath = [bearingPoint, point];
      speedPath = [bearingPoint, point];
    }

    let bearingText = query.bearing + '°';
    if (query.bearing < 10) {
      bearingText = '  ' + bearingText;
    } else if (query.bearing < 100) {
      bearingText = ' ' + bearingText;
    }

    // show bearing angle
    LT.textPath(bearingPath, bearingText, {
      color,
      size: [query.radius / 20, 'm'],
      verticalOffset: [-10, 'm'],
    }).addTo(map);

    if (query.speed) {
      // show speed
      const speed = Math.round(query.speed * 3.6);
      LT.textPath(speedPath, `${speed} km/h`, {
        color,
        size: [query.radius / 20, 'm'],
        verticalOffset: [35, 'm'],
      }).addTo(map);
    }
  }
}

(() => {
  const defaultLocation = (() => {
    const defaults = new ParsedQuery();
    return L.latLng(defaults.lat, defaults.lng);
  })();

  const query = parseQuery(window.location.search);
  const initialZoom = 13;
  const map = L.map('map').setView(defaultLocation, initialZoom);
  const location = L.latLng(query.lat, query.lng);
  if (query.bearing || query.bearing === 0) {
    isStreetViewSupportedAt(location).then((hasStreetView) => {
      (query as ParsedQuery).hasStreetView = hasStreetView;
    });
  }
  locationSet(map, query, location);
})();
