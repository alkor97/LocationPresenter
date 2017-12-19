
import * as D from '../distance';

describe('Distance', () => {
    it('is created correctly', () => {
        let value = 0;
        // tslint:disable-next-line:forin
        for (const unit in D.Unit) {
            const d = D.distance(++value, unit as D.Unit);
            expect(d.value).toEqual(value);
            expect(d.unit).toEqual(unit);
        }
    });
    it('is correctly multiplied', () => {
        let value = 0;
        // tslint:disable-next-line:forin
        for (const unit in D.Unit) {
            const d = D.distance(++value, unit as D.Unit).multiply(2);
            expect(d.value).toEqual(2 * value);
            expect(d.unit).toEqual(unit);
        }
    });
    it('returns itself on multiplication by 1', () => {
        const d = D.meters(13);
        expect(d.multiply(1)).toBe(d);
    });
    it('is correctly converted', () => {
        expect(D.kilometers(1).to(D.Unit.METERS).value).toEqual(1000);
    });
    it('returns itself on no-change conversion', () => {
        const d = D.meters(13);
        expect(d.to(D.Unit.METERS)).toBe(d);
    });
    it('dedicated methods return correct distances', () => {
        expect(D.pixels(1)).toEqual(D.distance(1, D.Unit.PIXELS));
        expect(D.meters(1)).toEqual(D.distance(1, D.Unit.METERS));
        expect(D.kilometers(1)).toEqual(D.distance(1, D.Unit.KILOMETERS));
        expect(D.feet(1)).toEqual(D.distance(1, D.Unit.FEET));
        expect(D.yards(1)).toEqual(D.distance(1, D.Unit.YARDS));
        expect(D.miles(1)).toEqual(D.distance(1, D.Unit.MILES));
        expect(D.nauticalMiles(1)).toEqual(D.distance(1, D.Unit.NAUTICAL_MILES));
    });
});
