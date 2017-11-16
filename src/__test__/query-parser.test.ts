
import { ParsedQuery, parseQuery } from '../query-parser';

describe('QueryParser', () => {
  const expected = {
    lat: 12.3,
    lng: 23.4,
    alt: 34,
    radius: 450,
    name: 'Jan Kowalski',
    phone: '+48 987 654 321',
    bearing: 56,
    speed: 6.78,
    dbg: 1,
    // defaults, not part of external interface
    hasStreetView: false,
  };

  it('parses values correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const actual = parseQuery(`?lat=${expected.lat}&lng=${expected.lng}&alt=${expected.alt}&radius=${expected.radius}`
      + `&name=${name}&phone=${phone}&bearing=${expected.bearing}&speed=${expected.speed}`
      + `&dbg=${expected.dbg}`);
    expect(actual).toEqual(expected);
  });

  it('parses CSV query correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const actual = parseQuery(`?q=${expected.lat},${expected.lng},${expected.alt},${expected.radius},`
      + `${name},${phone},${expected.bearing},${expected.speed},${expected.dbg}`);
    expect(actual).toEqual(expected);
  });

  it('returns defaults on error', () => {
    expect(parseQuery('')).toEqual(new ParsedQuery());
    expect(parseQuery('?')).toEqual(new ParsedQuery());
    expect(parseQuery('?q')).toEqual(new ParsedQuery());
    expect(parseQuery('?q=')).toEqual(new ParsedQuery());
  });

  it('returns defaults on missing CSV component', () => {
    const phone = encodeURIComponent(expected.phone);
    const actual = parseQuery(`?q=${expected.lat},${expected.lng},${expected.alt},${expected.radius},`
      + `,${phone},,${expected.speed}`);
    const defaults = new ParsedQuery();
    expect(actual.name).toEqual(defaults.name);
    expect(actual.phone).toEqual(expected.phone);
    expect(actual.bearing).toEqual(defaults.bearing);
    expect(actual.speed).toEqual(expected.speed);
    expect(actual.dbg).toEqual(defaults.dbg);
  });
});
