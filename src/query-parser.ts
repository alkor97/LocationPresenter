
export enum Provider {
  UNKNOWN = '?', GPS = 'gps', NETWORK = 'network',
}

export interface Query {
  readonly date: Date;
  readonly provider?: Provider;
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

function now(): Date {
  const date = new Date();
  date.setMilliseconds(0);
  return date;
}

export class ParsedQuery {
  public date: Date = now();
  public provider: Provider = Provider.UNKNOWN;
  public lat: number = 53.4296143;
  public lng: number = 14.5445406;
  public alt: number = 37;
  public radius: number = 750;
  public name: string = 'Frania Bąbolewska';
  public phone: string = '+48123456789';
  public bearing?: number;
  public speed?: number;
  public hasStreetView: boolean = false;
  public dbg?: number = 0;
  [key: string]: any;
}

const NUMBER_PROPERTIES = {lat: 1, lng: 1, alt: 1, radius: 1, bearing: 1, speed: 1, dbg: 1};
const DATE_PROPERTIES = {date: 1};

export function parseQuery(queryString: string): Query {
  const q = queryString.trim().replace(/^\?/, '');
  if (q.indexOf('q=') === 0) {
    return parseCSVQuery(q);
  } else {
    return parseObjectQuery(q);
  }
}

function parseValue(output: ParsedQuery, key: string, value: string): ParsedQuery {
  if (key in NUMBER_PROPERTIES) {
    output[key] = parseFloat(value);
  } else if (key in DATE_PROPERTIES) {
    output[key] = new Date(Date.parse(value));
  } else if (key === 'provider') {
    if (value === 'gps') {
      output[key] = Provider.GPS;
    } else if (value === 'network') {
      output[key] = Provider.NETWORK;
    }
  } else {
    output[key] = value;
  }
  return output;
}

function parseCSVQuery(csv: string): Query {
  const positionMapping = ['date', 'provider', 'lat', 'lng', 'alt', 'radius', 'name', 'phone',
    'bearing', 'speed', 'dbg'];
  return csv.replace(/^q[\=]/, '')
    .split(',')
    .reduce((state: ParsedQuery, entry: string, position: number) => {
      const key = positionMapping[position];
      if (key) {
        const value = decodeURIComponent(entry);
        if (value) {
          parseValue(state, key, value);
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
        state = parseValue(state, key, value);
      }
      return state;
    }, new ParsedQuery());
}
