
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
  readonly dbg?: number;
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
  public dbg?: number = 0;
  [key: string]: any;
}

const NUMBER_PROPERTIES = {lat: 1, lng: 1, alt: 1, radius: 1, bearing: 1, speed: 1, dbg: 1};

export function parseQuery(queryString: string): Query {
  const q = queryString.trim().replace(/^\?/, '');
  if (q.indexOf('q=') === 0) {
    return parseCSVQuery(q);
  } else {
    return parseObjectQuery(q);
  }
}

function parseCSVQuery(csv: string): Query {
  const positionMapping = ['lat', 'lng', 'alt', 'radius', 'name', 'phone', 'bearing', 'speed', 'dbg'];
  return csv.replace(/^q[\=]/, '')
    .split(',')
    .reduce((state: ParsedQuery, entry: string, position: number) => {
      const key = positionMapping[position];
      if (key) {
        const value = decodeURIComponent(entry);
        if (value) {
          if (key in NUMBER_PROPERTIES) {
            state[key] = parseFloat(value);
          } else {
            state[key] = value;
          }
        }
      }
      return state;
    }, new ParsedQuery());
}

function parseObjectQuery(queryString: string): Query {
  const allowed = new ParsedQuery();
  allowed.bearing = allowed.speed = 0;
  return queryString.split('&')
    .reduce((state: ParsedQuery, pairString: string) => {
      const pair = pairString.split('=');
      const key = decodeURIComponent(pair[0]);
      if (key in allowed) {
        const value = decodeURIComponent(pair[1]);
        if (key in NUMBER_PROPERTIES) {
          state[key] = parseFloat(value);
        } else {
          state[key] = value;
        }
      }
      return state;
    }, new ParsedQuery());
}
