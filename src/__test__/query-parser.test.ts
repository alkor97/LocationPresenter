
import { ParsedQuery, parseQuery } from '../query-parser';

describe('QueryParser', () => {
  const expected = {
    date: new Date(2015, 3, 2, 15, 14, 13, 213),
    provider: 'network',
    lat: 12.3,
    lng: 23.4,
    alt: 34,
    radius: 450,
    name: 'Jan Kowalski',
    phone: '+48 987 654 321',
    bearing: 56,
    speed: 6.78,
    // defaults, not part of external interface
    hasStreetView: false,
  };

  it('parses values correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const date = expected.date.toISOString();
    const actual = parseQuery(`?lat=${expected.lat}&lng=${expected.lng}&alt=${expected.alt}&radius=${expected.radius}`
      + `&name=${name}&phone=${phone}&bearing=${expected.bearing}&speed=${expected.speed}`
      + `&date=${date}&provider=${expected.provider}`);
    expect(actual).toEqual(expected);
  });

  it('parses CSV query correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const date = expected.date.toISOString();
    const actual = parseQuery(`?q=${date},${expected.provider},${expected.lat},${expected.lng},`
      + `${expected.alt},${expected.radius},${expected.bearing},${expected.speed},${phone},${name}`);
    expect(actual).toEqual(expected);
  });

  it('returns defaults on error', () => {
    const q = new ParsedQuery();
    q.date = new Date();
    q.date.setMilliseconds(0);
    expect(parseQuery('')).toEqual(q);
    expect(parseQuery('?')).toEqual(q);
    expect(parseQuery('?q')).toEqual(q);
    expect(parseQuery('?q=')).toEqual(q);
  });

  it('returns defaults on missing CSV component', () => {
    const phone = encodeURIComponent(expected.phone);
    const actual = parseQuery(`?q=,,${expected.lat},${expected.lng},${expected.alt},${expected.radius},`
      + `,${expected.speed},${phone},`);
    const defaults = new ParsedQuery();
    expect(actual.name).toEqual(defaults.name);
    expect(actual.phone).toEqual(expected.phone);
    expect(actual.bearing).toEqual(defaults.bearing);
    expect(actual.speed).toEqual(expected.speed);
  });
});
