
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
        const data = [
            D.meters(1000), D.kilometers(1), D.feet(3281), D.yards(1094), D.miles(0.6214), D.nauticalMiles(0.54)
        ];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < data.length; ++i) {
            const from = data[i];
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < data.length; ++j) {
                const to = data[j];
                const computed = from.to(to.unit).value;
                const relativeError = Math.abs((to.value - computed) / Math.max(to.value, computed));
                expect(relativeError).toBeLessThan(0.01);
            }
        }
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
