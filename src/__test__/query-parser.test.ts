
import { ParsedQuery, parseQuery, Provider } from '../query-parser';

describe('QueryParser', () => {
  function toString(date: Date): string {
    return '' + date.getUTCFullYear()
      + ('00' + (date.getUTCMonth() + 1)).slice(-2)
      + ('00' + date.getUTCDate()).slice(-2)
      + ('00' + date.getUTCHours()).slice(-2)
      + ('00' + date.getUTCMinutes()).slice(-2)
      + ('00' + date.getUTCSeconds()).slice(-2);
    }

  const expected = {
    date: new Date(2015, 3, 2, 15, 14, 13, 0),
    provider: 'network',
    lat: 12.3,
    lng: 23.4,
    radius: 450,
    alt: 34,
    altAccuracy: 1.2,
    name: 'Jan Kowalski',
    phone: '+48 987 654 321',
    bearing: 56,
    bearingAccuracy: 20.3,
    speed: 6.78,
    speedAccuracy: 2.3,
  };

  it('parses values correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const date = toString(expected.date);
    const actual = parseQuery(`?lat=${expected.lat}&lng=${expected.lng}&radius=${expected.radius}`
      + `&alt=${expected.alt}&altAccuracy=${expected.altAccuracy}`
      + `&bearing=${expected.bearing}&bearingAccuracy=${expected.bearingAccuracy}`
      + `&speed=${expected.speed}&speedAccuracy=${expected.speedAccuracy}`
      + `&name=${name}&phone=${phone}&date=${date}&provider=${expected.provider}`);
    expect(actual).toEqual(expected);
  });

  it('parses CSV query correctly', () => {
    const name = encodeURIComponent(expected.name);
    const phone = encodeURIComponent(expected.phone);
    const date = toString(expected.date);
    const actual = parseQuery(`?q=${date},${expected.provider},${expected.lat},${expected.lng},${expected.radius},`
      + `${expected.alt},${expected.altAccuracy},${expected.bearing},${expected.bearingAccuracy},`
      + `${expected.speed},${expected.speedAccuracy},${phone},${name}`);
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
    const actual = parseQuery(`?q=,,${expected.lat},${expected.lng},${expected.radius},${expected.alt},,`
      + `,,${expected.speed},,${phone},`);
    const defaults = new ParsedQuery();
    expect(actual.name).toEqual(defaults.name);
    expect(actual.phone).toEqual(expected.phone);
    expect(actual.bearing).toEqual(defaults.bearing);
    expect(actual.speed).toEqual(expected.speed);
  });

  it('parses correctly request from application', () => {
    const actual = '?q=20170513213841,gps,53,14,20,13,,,,,,%2B48123456789,Test1';
    const localExpected: ParsedQuery = {
      date: new Date('2017-05-13T21:38:41Z'),
      provider: Provider.GPS,
      lat: 53,
      lng: 14,
      radius: 20,
      alt: 13,
      altAccuracy: undefined,
      bearing: undefined,
      bearingAccuracy: undefined,
      speed: undefined,
      speedAccuracy: undefined,
      phone: '+48123456789',
      name: 'Test1'
    };
    expect(parseQuery(actual)).toEqual(localExpected);
  });

  it('parses correctly complete request', () => {
    const actual = '?q=20170513213841,gps,53,14,20,13,2,137,15,21,2,%2B48123456789,Test1';
    const localExpected: ParsedQuery = {
      date: new Date('2017-05-13T21:38:41Z'),
      provider: Provider.GPS,
      lat: 53,
      lng: 14,
      radius: 20,
      alt: 13,
      altAccuracy: 2,
      bearing: 137,
      bearingAccuracy: 15,
      speed: 21,
      speedAccuracy: 2,
      phone: '+48123456789',
      name: 'Test1'
    };
    expect(parseQuery(actual)).toEqual(localExpected);
  });
});
