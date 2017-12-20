
export enum Unit {
    PIXELS = 'px',
    METERS = 'm',
    KILOMETERS = 'km',
    FEET = 'ft',
    YARDS = 'yd',
    MILES = 'mi',
    NAUTICAL_MILES = 'nm',
}

class OneMeter {
    public readonly m = 1;
    public readonly km = 1000;
    public readonly ft = 0.3048;
    public readonly yd = 0.9144;
    public readonly mi = 1609.344;
    public readonly nm = 1852;
    readonly [key: string]: number;
}

const ONE_METER = new OneMeter();

export type NaturalDistanceUnit = Unit.METERS | Unit.KILOMETERS | Unit.NAUTICAL_MILES
    | Unit.FEET | Unit.YARDS | Unit.MILES;

// tslint:disable-next-line:max-classes-per-file
export class NaturalDistance {
    public readonly value: number;
    public readonly unit: NaturalDistanceUnit;

    constructor(value: number = 0, unit: NaturalDistanceUnit = Unit.METERS) {
        this.value = value;
        this.unit = unit;
    }

    public to(unit: NaturalDistanceUnit): NaturalDistance | this {
        if (unit !== this.unit) {
            const source = this.value * ONE_METER[this.unit];
            const target = source / ONE_METER[unit];
            return new NaturalDistance(target, unit);
        }
        return this;
    }

    public multiply(value: number): NaturalDistance | this {
        if (value !== 1) {
            return new NaturalDistance(this.value * value, this.unit);
        }
        return this;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class PixelDistance {
    public readonly value: number;
    public readonly unit: Unit.PIXELS;

    constructor(value: number = 0) {
        this.value = value;
    }

    public to(unit: Unit.PIXELS): PixelDistance | this {
        return this;
    }

    public multiply(value: number): PixelDistance | this {
        if (value !== 1) {
            return new PixelDistance(this.value * value);
        }
        return this;
    }
}

export function pixels(value: number): PixelDistance {
    return new PixelDistance(value);
}

export function meters(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.METERS);
}

export function kilometers(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.KILOMETERS);
}

export function feet(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.FEET);
}

export function yards(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.YARDS);
}

export function miles(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.MILES);
}

export function nauticalMiles(value: number): NaturalDistance {
    return new NaturalDistance(value, Unit.NAUTICAL_MILES);
}

export type Distance = NaturalDistance | PixelDistance;

export function distance(value: number, unit: Unit): Distance {
    if (unit === Unit.PIXELS) {
        return new PixelDistance(value);
    } else {
        return new NaturalDistance(value, unit);
    }
}
