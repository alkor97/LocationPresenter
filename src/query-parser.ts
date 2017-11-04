
export interface Query {
  readonly lat: number;
  readonly lng: number;
  readonly alt: number;
  readonly radius: number;
  readonly name: string;
  readonly phone: string;
  readonly bearing?: number;
  readonly speed?: number;
  readonly hasStreetView: boolean;
}

export class ParsedQuery {
  public lat: number = 53.4296143;
  public lng: number = 14.5445406;
  public alt: number = 37;
  public radius: number = 750;
  public name: string = 'Krysia';
  public phone: string = '+48123456789';
  public bearing?: number;
  public speed?: number;
  public hasStreetView: boolean = false;
  [key: string]: any;
}

export function parseQuery(queryString: string): Query {
  const numberProperties: string[] = ['lat', 'lng', 'alt', 'radius', 'bearing', 'speed'];
  return queryString.trim()
    .substring(queryString.charAt(0) === '?' ? 1 : 0)
    .split('&')
    .reduce((state: ParsedQuery, pairString: string) => {
      const pair = pairString.split('=');
      const key = decodeURIComponent(pair[0]);
      if (key) {
        const value = decodeURIComponent(pair[1]);
        if (numberProperties.indexOf(key) > -1) {
          state[key] = parseFloat(value);
        } else {
          state[key] = value;
        }
      }
      return state;
    }, new ParsedQuery());
}
