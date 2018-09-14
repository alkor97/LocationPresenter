
export enum Provider {
  UNKNOWN = '?', GPS = 'gps', NETWORK = 'network',
}

export interface Query {
  readonly date: Date;
  readonly provider?: Provider;
  readonly lat: number;
  readonly lng: number;
  readonly alt?: number;
  readonly radius?: number;
  readonly name?: string;
  readonly phone?: string;
  readonly bearing?: number;
  readonly speed?: number;
  readonly hasStreetView: boolean;
  readonly address?: string;
}

function now(): Date {
  const date = new Date();
  date.setMilliseconds(0);
  return date;
}

export class ParsedQuery implements Query {
  public date: Date = now();
  public provider?: Provider = Provider.UNKNOWN;
  public lat: number = 53.4296143;
  public lng: number = 14.5445406;
  public hasStreetView: boolean = false;
  public address?: string = undefined;
  [key: string]: any;
}

// tslint:disable-next-line:max-classes-per-file
class AllowedEntries extends ParsedQuery {
  public alt: number = 1;
  public radius: number = 1;
  public name: string = 'x';
  public phone: string = '1';
  public bearing: number = 1;
  public speed: number = 1;
}

const NUMBER_PROPERTIES = {lat: 1, lng: 1, alt: 1, radius: 1, bearing: 1, speed: 1};
const DATE_PROPERTIES = {date: 1};

export function parseQuery(queryString: string): Query {
  const q = queryString.trim().replace(/^\?/, '');
  if (q.indexOf('q=') === 0) {
    return parseCSVQuery(q);
  } else {
    return parseObjectQuery(q);
  }
}

function parseDate(text: string): Date {
  const date = new Date();
  const re = new RegExp(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  const result = re.exec(text);
  if (result) {
    if (result.length > 1) { date.setUTCFullYear(parseInt(result[1], 10)); }
    if (result.length > 2) { date.setUTCMonth(parseInt(result[2], 10) - 1); }
    if (result.length > 3) { date.setUTCDate(parseInt(result[3], 10)); }
    if (result.length > 4) { date.setUTCHours(parseInt(result[4], 10)); }
    if (result.length > 5) { date.setUTCMinutes(parseInt(result[5], 10)); }
    if (result.length > 6) { date.setUTCSeconds(parseInt(result[6], 10)); }
    date.setUTCMilliseconds(0);
  }
  return date;
}

function parseValue(output: ParsedQuery, key: string, value: string): ParsedQuery {
  if (key in NUMBER_PROPERTIES) {
    output[key] = parseFloat(value);
  } else if (key in DATE_PROPERTIES) {
    output[key] = parseDate(value);
  } else if (key === 'provider') {
    if (value.toLowerCase() === 'gps') {
      output[key] = Provider.GPS;
    } else if (value.toLowerCase() === 'network') {
      output[key] = Provider.NETWORK;
    }
  } else {
    output[key] = value;
  }
  return output;
}

function parseCSVQuery(csv: string): Query {
  const positionMapping = ['date', 'provider', 'lat', 'lng', 'alt', 'radius', 'bearing', 'speed', 'phone', 'name'];
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
  const allowed = new AllowedEntries();
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
