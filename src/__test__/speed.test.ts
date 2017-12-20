
import * as S from '../speed';

describe('Speed', () => {
    it('is converted correctly', () => {
        const data = [
            S.speed(10, S.Unit.METERS_PER_SECOND),
            S.speed(36, S.Unit.KILOMETERS_PER_HOUR),
            S.speed(22.37, S.Unit.MILES_PER_HOUR),
            S.speed(19.44, S.Unit.KNOTS)
        ];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < data.length; ++i) {
            const from = data[i];
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < data.length; ++j) {
                const to = data[j];
                expect(from.to(to.unit).value).toBeCloseTo(to.value);
            }
        }
    });
});
