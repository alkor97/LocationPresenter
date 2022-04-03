import * as L from 'leaflet';
import 'leaflet-arrows';
import { getAddress } from './address-provider';
import './assets';
import * as D from './distance';
import './l10n';
import { calculateEndPoint } from './leaflet-helpers';
import { TextAlign, textLayer } from './leaflet-textlayer';
import { preparePopup } from './popup';
import { ParsedQuery, parseQuery, Query } from './query-parser';

function locationSet(map: L.Map, query: Query, point: L.LatLng) {
  const popup = () => {
    return preparePopup(query);
  };

  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const marker = L.marker(point).addTo(map);
  const maxWidthValue = 200;
  marker.bindPopup(popup, {
    maxWidth: maxWidthValue
  });

  if (query.radius) {
    const circle = L.circle(point, {
      opacity: 0.0,
      fillColor: 'red',
      fillOpacity: 0.25,
      radius: query.radius,
    }).addTo(map);
    circle.bindPopup(popup, {
      maxWidth: maxWidthValue
    });
    map.flyToBounds(circle.getBounds());

    const textColor = '#3388ff';
    const weight = 3;
    const textSize = D.meters(Math.max(5, query.radius / 10));

    if (query.bearing || query.bearing === 0) {
      // workaround: if arrow angle is 0 then line rendering is discarded;
      // replacing it with 360 degrees resolves the problem
      const arrowAngle = query.bearing === 0 ? 360 : query.bearing;
      const arrowHeadLength = D.meters(0.05 * query.radius).to(D.Unit.KILOMETERS).value;

      // show bearing arrow
      const arrow = new L.Arrow({
        latlng: point,
        degree: arrowAngle,
        distance: query.radius / 1000,
      }, {
          distanceUnit: 'km',
          arrowheadLength: arrowHeadLength,
          color: textColor,
          weight,
        }).addTo(map);

      const verticalOffset = query.bearing < 90 || query.bearing > 270 ? textSize.multiply(0.1) : textSize;

      const radiusPoint = calculateEndPoint(point, D.meters(1.05 * query.radius), query.bearing);

      let radiusPointStart = radiusPoint;
      let radiusPointEnd = radiusPoint;
      let textAlign;

      if (query.bearing < 180) {
        radiusPointEnd = calculateEndPoint(radiusPoint, D.meters(query.radius), 90);
        textAlign = TextAlign.START;
      } else {
        radiusPointStart = calculateEndPoint(radiusPoint, D.meters(query.radius), 270);
        textAlign = TextAlign.END;
      }

      // show location radius
      textLayer(radiusPointStart, radiusPointEnd, `${query.radius} m`, {
        textColor,
        textSize,
        verticalOffset,
        textAlign,
      }).addTo(map);

      const arrowHeadEndPoint = calculateEndPoint(point, D.meters(0.9 * query.radius), query.bearing);
      const bearingVerticalOffset = D.pixels(-5);
      const secondaryTextSize = textSize.multiply(0.8);

      // show bearing angle
      if (query.bearing < 180) {
        textLayer(point, arrowHeadEndPoint, `${query.bearing}°`, {
          textColor,
          textSize: secondaryTextSize,
          verticalOffset: bearingVerticalOffset,
          textAlign: TextAlign.END,
        }).addTo(map);
      } else {
        textLayer(arrowHeadEndPoint, point, `${query.bearing}°`, {
          textColor,
          textSize: secondaryTextSize,
          verticalOffset: bearingVerticalOffset,
          textAlign: TextAlign.START,
        }).addTo(map);
      }

      if (query.speed) {
        // show speed
        const speed = Math.round(query.speed * 3.6);
        if (query.bearing < 180) {
          textLayer(point, arrowHeadEndPoint, `${speed} km/h`, {
            textColor,
            textSize: secondaryTextSize,
            verticalOffset: secondaryTextSize,
            textAlign: TextAlign.END,
          }).addTo(map);
        } else {
          textLayer(arrowHeadEndPoint, point, `${speed} km/h`, {
            textColor,
            textSize: secondaryTextSize,
            verticalOffset: secondaryTextSize,
            textAlign: TextAlign.START,
          }).addTo(map);
        }
      }
    }
    if (query.alt) {
      const altArrowHeight = textSize;
      const rotate = (query.bearing || query.bearing === 0) && query.bearing < 180 ? 270 : 90;
      const altArrowBasePoint = calculateEndPoint(point, altArrowHeight, rotate);
      const altTextNearPoint = calculateEndPoint(altArrowBasePoint, textSize.multiply(0.5), rotate);
      const altTextFarPoint = calculateEndPoint(altTextNearPoint, D.meters(query.radius), rotate);

      new L.Arrow({
        latlng: altArrowBasePoint,
        degree: 360,
        distance: altArrowHeight.to(D.Unit.KILOMETERS).value,
      }, {
          distanceUnit: 'km',
          arrowheadLength: altArrowHeight.multiply(0.2).to(D.Unit.KILOMETERS).value,
          color: textColor,
          weight,
        }).addTo(map);

      if (query.bearing && query.bearing < 180) {
        textLayer(altTextFarPoint, altTextNearPoint, `${query.alt} m`, {
          textColor,
          textSize,
          textAlign: TextAlign.END,
        }).addTo(map);
      } else {
        textLayer(altTextNearPoint, altTextFarPoint, `${query.alt} m`, {
          textColor,
          textSize,
          textAlign: TextAlign.START,
        }).addTo(map);
      }
    }
  }
}

(() => {
  document.title = 'title'.toLocaleString();

  const defaultLocation = (() => {
    const defaults = new ParsedQuery();
    return L.latLng(defaults.lat, defaults.lng);
  })();

  const query = parseQuery(window.location.search);
  const initialZoom = 13;
  const map = L.map('map').setView(defaultLocation, initialZoom);
  const location = L.latLng(query.lat, query.lng);

  getAddress(location, navigator.language)
    .then((address: string[]) => {
      (query as ParsedQuery).address = address;
    });
  locationSet(map, query, location);
})();
