
import * as D from './distance';
import { Provider, Query } from './query-parser';
import * as S from './speed';

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

function withAccuracy(accuracy?: number): string {
    return accuracy ? ` ±${accuracy} ` : ' ';
}

export function preparePopup(q: Query): string {
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
    const name = q.name ? q.name : 'yourLocation'.toLocaleString();

    const altitudeLine = getInfoLine('altitude'.toLocaleString(), q.alt,
        () => (withAccuracy(q.altAccuracy) + D.Unit.METERS));
    const radiusLine = getInfoLine('radius'.toLocaleString(), q.radius, () => ' ' + D.Unit.METERS);
    const directionArrow = q.bearing ? `${getDirectionArrow(q.bearing)}` : '';
    const direction = q.bearing
        ? `${getDirection(q.bearing)} ${directionArrow}`
        : '';
    const bearingLine = getInfoLine('bearing'.toLocaleString(), q.bearing,
        () => ('° ' + withAccuracy(q.bearingAccuracy) + '(' + direction + ')'));
    const typedSpeed = q.speed
        ? Math.round(
            S.speed(q.speed, S.Unit.METERS_PER_SECOND)
                .to(S.Unit.KILOMETERS_PER_HOUR)
                .value)
        : undefined;
    const typedSpeedAccuracy = q.speedAccuracy
        ? Math.round(
            S.speed(q.speedAccuracy, S.Unit.METERS_PER_SECOND)
                .to(S.Unit.KILOMETERS_PER_HOUR)
                .value)
        : undefined;
    const speedLine = getInfoLine('speed'.toLocaleString(), typedSpeed,
        () => (withAccuracy(typedSpeedAccuracy) + S.Unit.KILOMETERS_PER_HOUR));
    const location = 'location'.toLocaleString();

    let addressLine = '';
    if (q.address) {
        const addressHead = 'address'.toLocaleString();
        addressLine = `<tr><th>${addressHead}</th><td id="addressLines" colspan="2">`
            + q.address.map((v) => {
                return '<p class="dont-break-out">' + v + '</p>';
            }).join('')
            + '</td></tr>';
    }

    return `<table class="popup"">
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
            <td></td>
        </tr>
        ${addressLine}
        ${altitudeLine}
        ${radiusLine}
        ${bearingLine}
        ${speedLine}
    </table>`;
}
