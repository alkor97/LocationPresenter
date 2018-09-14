
import { LatLng } from 'leaflet';

export interface Address {
    readonly house_number?: string;
    readonly road?: string;
    readonly neighbourhood?: string;
    readonly suburb?: string;
    readonly hamlet?: string;
    readonly city_district?: string;
    readonly village?: string;
    readonly town?: string;
    readonly city?: string;
    readonly county?: string;
    readonly state_district?: string;
    readonly state?: string;
    readonly postcode?: string;
    readonly country?: string;
}

interface NominatimResponse {
    readonly name?: string;
    readonly address: Address;
}

type OptionalString = string | undefined;

function joinNotNull(separator: string, ...values: OptionalString[]): string {
    return values.filter((v) => !!v)
        .join(separator);
}

function formatAddress(response: NominatimResponse): string {
    const address = response.address;
    return joinNotNull(
        '<br>',
        joinNotNull(' ', response.name),
        joinNotNull(' ', address.road, address.house_number),
        joinNotNull(' ', address.suburb),
        joinNotNull(' ', address.city_district),
        joinNotNull(' ', address.postcode, address.city || address.town || address.village || address.hamlet),
        joinNotNull(' ', address.county),
        joinNotNull(' ', address.state_district),
        joinNotNull(' ', address.state),
        joinNotNull(' ', address.country));
}

export function getAddress(latLng: LatLng, language: string): Promise<string> {
    const url = getNominatimUrl(latLng, language);
    return new Promise((resolve, reject) => {
        return fetch(url).then((response) => {
            if (!response.ok) {
                reject(response.statusText);
            }
            response.json().then((data) => {
                resolve(formatAddress(data as NominatimResponse));
            }).catch((reason) => {
                reject(reason);
            });
        }).catch((reason) => {
            reject(reason);
        });
    });
}

interface NominatimQuery {
    readonly format: string;
    readonly 'accept-language': string;
    readonly lat: number;
    readonly lon: number;
    readonly zoom: number;
    readonly addressdetails: number;
    [key: string]: any;
}

function getNominatimUrl(latLng: LatLng, language: string): string {
    const q: NominatimQuery = {
        'format': 'jsonv2',
        'accept-language': language,
        'lat': latLng.lat,
        'lon': latLng.lng,
        'zoom': 18,
        'addressdetails': 1
    };
    const parameters = Object.keys(q).map((key) => {
        const value = q[key];
        return `${key}=${value}`;
    }).join('&');
    return `https://nominatim.openstreetmap.org/reverse?${parameters}`;
}
