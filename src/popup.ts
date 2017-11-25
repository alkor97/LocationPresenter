
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

export function preparePopup(q: Query): string {
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
