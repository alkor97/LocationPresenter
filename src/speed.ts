
import {Unit as DistanceUnit} from './distance';

export enum Unit {
    METERS_PER_SECOND = 'm/s',
    KILOMETERS_PER_HOUR = 'km/h',
    MILES_PER_HOUR = 'mph',
    KNOTS = 'kn'
}

class OneMeterPerSecond {
    public readonly 'm/s' = 1;
    public readonly 'km/h' = 3.6;
    public readonly 'mph' = 2.237;
    public readonly 'kn' = 1.944;
}

const ONE_METER_PER_SECOND = new OneMeterPerSecond();

// tslint:disable-next-line:max-classes-per-file
export class Speed {
    public readonly value: number;
    public readonly unit: Unit;

    constructor(value: number, unit: Unit) {
        this.value = value;
        this.unit = unit;
    }

    public to(unit: Unit): Speed | this {
        if (unit === this.unit) {
            return this;
        } else {
            const source = this.value / ONE_METER_PER_SECOND[this.unit];
            const target = source * ONE_METER_PER_SECOND[unit];
            return new Speed(target, unit);
        }
    }
}

export function speed(value: number, unit: Unit) {
    return new Speed(value, unit);
}
