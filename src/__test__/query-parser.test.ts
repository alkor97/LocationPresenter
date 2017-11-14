
import { ParsedQuery, parseQuery } from '../query-parser';

describe('QuerParser', () => {

  it('returns defaults if no input data', () => {
    const current = parseQuery('');
    expect(current).toEqual(new ParsedQuery());
  });

  it('parses values correctly', () => {
    const expected = {
      lat: 12.3,
      lng: 23.4,
      alt: 34,
      radius: 450,
      name: 'Jasio',
      phone: '+48987654321',
      bearing: 56,
      speed: 6.78,
      dbg: 1,
      // defaults, not part of external interface
      hasStreetView: false,
    };
    const actual = parseQuery(`?lat=${expected.lat}&lng=${expected.lng}&alt=${expected.alt}&radius=${expected.radius}`
      + `&name=${expected.name}&phone=${expected.phone}&bearing=${expected.bearing}&speed=${expected.speed}`
      + `&dbg=${expected.dbg}`);
    expect(actual).toEqual(expected);
  });
});
