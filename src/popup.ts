
import * as D from './distance';
import { Provider, Query } from './query-parser';
import * as S from './speed';

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

function formatPhone(phone: string): string {
    let input = phone.replace(/\s+/g, '');
    const groups = [];
    for (let i = 0; i < 3; ++i) {
        groups.unshift(input.substr(input.length - 3));
        input = input.slice(0, -3);
    }
    groups.unshift(input);
    if (groups.length > 0 && groups[0].startsWith('00')) {
        groups[0] = '+' + groups[0].substr(2);
    }
    return groups.join('&nbsp;');
}

function getInfoLine(name: string, value: number | string | undefined, suffix: () => string = () => ''): string {
    if (value) {
        return `<tr>
            <th>${name}</th>
            <td>${value}${suffix()}</td>
        </tr>`;
    }
    return '';
}

const DIRECTIONS = [
    '↑N', '↗NE', '→E', '↘SE', '↓S', '↙SW', '←W', '↖NW'
];

function getDirection(bearing: number): string {
    const normalized = ((bearing % 360) - 22.5) / 45;
    return DIRECTIONS[Math.ceil(normalized) % DIRECTIONS.length].substr(1);
}

function getDirectionArrow(bearing: number): string {
    const normalized = ((bearing % 360) - 22.5) / 45;
    return DIRECTIONS[Math.ceil(normalized) % DIRECTIONS.length].substr(0, 1);
}

export function preparePopup(q: Query): string {
    const withStreetView = q.hasStreetView ? 'inline' : 'none';
    const link = getStreetViewLink(q);
    const provider = q.provider !== Provider.UNKNOWN
        ? `<img src="img/${q.provider}-inv.png" width="16" height="16"/>`
        : '';

    const dayOfWeek = q.date.toLocaleDateString(undefined, {weekday: 'long'}).toLocaleUpperCase();
    const hourMinute = q.date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}).toLocaleUpperCase();
    const day = q.date.getDate();
    const month = q.date.toLocaleDateString(undefined, {month: 'short'}).toLocaleUpperCase();
    const year = q.date.getFullYear();
    const phoneLink = q.phone ? q.phone.replace(/\s+/g, '') : '';
    const phone = q.phone ? formatPhone(q.phone) : '';
    const phoneSign = q.phone ? '✆&nbsp;' : '';
    const name = q.name ? q.name : '';

    const altitudeLine = getInfoLine('altitude'.toLocaleString(), q.alt, () => ' ' + D.Unit.METERS);
    const radiusLine = getInfoLine('radius'.toLocaleString(), q.radius, () => ' ' + D.Unit.METERS);
    const directionArrow = q.bearing ? `${getDirectionArrow(q.bearing)}` : '';
    const direction = q.bearing
        ? `${getDirection(q.bearing)} ${directionArrow}`
        : '';
    const bearingLine = getInfoLine('bearing'.toLocaleString(), q.bearing, () => ('° (' + direction + ')'));
    const typedSpeed = q.speed
        ? Math.round(
            S.speed(q.speed, S.Unit.METERS_PER_SECOND)
                .to(S.Unit.KILOMETERS_PER_HOUR)
                .value)
        : undefined;
    const speedLine = getInfoLine('speed'.toLocaleString(), typedSpeed, () => ' ' + S.Unit.KILOMETERS_PER_HOUR);
    const location = 'location'.toLocaleString();

    return `<table class="popup">
        <tr>
            <td class="day">${dayOfWeek}</td>
            <td rowspan="2" class="time">${hourMinute}</td>
            <td rowspan="2" class="provider">${provider}</td>
        </tr>
        <tr>
            <td class="date">${day}&nbsp;${month}&nbsp;${year}</td>
        </tr>
        <tr>
            <td class="name" colspan="2">${name}</td>
        </tr>
        <tr>
            <td class="phone" colspan="3">${phoneSign}<a href="tel:${phoneLink}">${phone}</a></td>
        </tr>
        <tr>
            <th>${location}</th>
            <td>${q.lat}<br>${q.lng}</td>
            <td>
                <a id="popupStreetViewAvailable" style='display: ${withStreetView}' href='${link}' target='_blank'>
                    <img src="img/eye-inv.png"/>
                </a>
            </td>
        </tr>
        ${altitudeLine}
        ${radiusLine}
        ${bearingLine}
        ${speedLine}
    </table>`;
}
