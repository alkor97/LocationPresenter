import * as L from 'leaflet';
import 'leaflet-arrows';
import './assets';
import { DebugImages } from './debug-images';
import { isStreetViewSupportedAt } from './has-street-view';
import * as LT from './leaflet-textpath';
import { ParsedQuery, parseQuery, Provider, Query } from './query-parser';

function isChromeOnAndroid() {
  const ua = navigator.userAgent;
  return ua.match(/android/i) && ua.match(/chrome/i);
}

function getStreetViewLink(q: Query): string {
  const prefix = 'http://maps.google.com/maps?q=&layer=c&cbll=';
  const regularLink = `${prefix}${q.lat},${q.lng}&cbp=0,${q.bearing},0,0,0`;
  if (isChromeOnAndroid()) {
    const fallback = encodeURI(regularLink);
    return 'intent://view/#Intent;package=com.google.android.apps.maps;scheme=google.streetview:'
      + `cbll=${q.lat},${q.lng}&cbp=1,${q.bearing},,0,1&mz=15;`
      + `S.browser_fallback_url=${fallback};end;`;
  }
  return regularLink;
}

function preparePopup(q: Query): string {
  const withStreetView = q.hasStreetView ? 'inline' : 'none';
  const link = getStreetViewLink(q);
  const date = q.date.toLocaleString();
  const provider = q.provider !== Provider.UNKNOWN
    ? `&nbsp;<img src="img/${q.provider}.png" width="16" height="16"/>`
    : '';
  return `${date}${provider}<br>
          <h1>${q.name}&nbsp;<a style='display: ${withStreetView}' href='${link}'
          target='_blank'><img src="img/eye.png" width="16" height="16"/></a></h1>
          <i><a href="tel:${q.phone}">${q.phone}</a></i>`;
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
      const bearingPoint = arrow._calculateEndPoint(point, 0.8 * query.radius / 1000, query.bearing);
      const speedPoint = arrow._calculateEndPoint(point, 0.7 * query.radius / 1000, query.bearing);
      bearingPath = [bearingPoint, arrowEndPoint];
      speedPath = [speedPoint, arrowEndPoint];
    } else {
      const bearingPoint = arrow._calculateEndPoint(point, 0.9 * query.radius / 1000, query.bearing);
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
      verticalOffset: [-20, 'm'],
    }).addTo(map);

    if (query.speed) {
      // show speed
      const speed = Math.round(query.speed * 3.6);
      LT.textPath(speedPath, `${speed} km/h`, {
        color,
        size: [query.radius / 20, 'm'],
        verticalOffset: [45, 'm'],
      }).addTo(map);
    }

    if (query.alt) {
      const altArrowStartPoint = query.bearing < 180
        ? arrow._calculateEndPoint(point, textSize[0] / 1000, 270)
        : arrow._calculateEndPoint(point, textSize[0] / 1000, 90);

      const altArrowTextLeft = arrow._calculateEndPoint(altArrowStartPoint, 0.01, 270);
      const altArrowTextRight = arrow._calculateEndPoint(altArrowStartPoint, 0.01, 90);
      const altTextStartPoint = query.bearing < 180
        ? altArrowTextLeft
        : altArrowTextRight;
      const altArrowLength = query.radius / 1000 / 10;

      new L.Arrow({
        latlng: altArrowStartPoint,
        degree: 360,
        distance: altArrowLength,
      }, {
        distanceUnit: 'km',
        arrowheadLength: 0.2 * altArrowLength,
        color,
        weight: arrowWeight,
      }).addTo(map);

      const altPath = query.bearing < 180
        ? [L.latLng(altArrowStartPoint.lat, altArrowStartPoint.lng - 5),
          altTextStartPoint]
        : [altTextStartPoint,
           L.latLng(altArrowStartPoint.lat, altArrowStartPoint.lng + 5)];

      const altAlign = query.bearing < 180
        ? LT.TextAlign.RIGHT
        : LT.TextAlign.LEFT;

      LT.textPath(altPath, `${query.alt} m`, {
        color,
        size: [query.radius / 20, 'm'],
        verticalOffset: [-15, 'm'],
        align: altAlign,
      }).addTo(map);

      L.polyline([altArrowTextLeft, altArrowTextRight]).addTo(map);
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
  if (query.dbg) {
    new DebugImages({position: 'topright'})
      .withLocation(location)
      .addTo(map);
  }

  if (query.bearing || query.bearing === 0) {
    isStreetViewSupportedAt(location).then((hasStreetView) => {
      (query as ParsedQuery).hasStreetView = hasStreetView;
    }).catch((reason) => {
      if (query.dbg) {
        alert(reason);
      }
    });
  }
  locationSet(map, query, location);
})();
