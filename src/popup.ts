
import { Provider, Query } from './query-parser';

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

function preparePopupOld(q: Query): string {
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

function formatPhone(phone: string): string {
    let input = phone.replace(/\s+/g, '');
    const groups = [];
    for (let i = 0; i < 3; ++i) {
        groups.unshift(input.substr(input.length - 3));
        input = input.slice(0, -3);
    }
    groups.unshift(input);
    return groups.join('&nbsp;');
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
    const phoneLink = q.phone.replace(/\s+/g, '');
    const phone = formatPhone(q.phone);
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
            <td class="name" colspan="2">${q.name}</td>
            <td>
                <a style='display: ${withStreetView}' href='${link}' target='_blank'>
                    <img src="img/eye-inv.png"/>
                </a>
            </td>
        </tr>
        <tr>
            <td class="phone" colspan="3">✆&nbsp;<a href="tel:${phoneLink}">${phone}</a></td>
        </tr>
    </table>`;
}
