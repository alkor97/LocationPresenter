
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

// tslint:disable-next-line:max-classes-per-file
export class ConversionError extends Error {
}

// tslint:disable-next-line:max-classes-per-file
export class Distance {
    public readonly value: number;
    public readonly unit: Unit;

    constructor(value: number = 0, unit: Unit = Unit.METERS) {
        this.value = value;
        this.unit = unit;
    }

    public to(unit: Unit): Distance | this {
        if ((unit === Unit.PIXELS || this.unit === Unit.PIXELS) && unit !== this.unit) {
            throw new ConversionError('Unable to convert between pixels and natural units');
        }
        if (unit !== this.unit) {
            const source = this.value * ONE_METER[this.unit];
            const target = source / ONE_METER[unit];
            return new Distance(target, unit);
        }
        return this;
    }

    public multiply(value: number): Distance | this {
        if (value !== 1) {
            return new Distance(this.value * value, this.unit);
        }
        return this;
    }
}

export function pixels(value: number): Distance {
    return new Distance(value, Unit.PIXELS);
}

export function meters(value: number): Distance {
    return new Distance(value, Unit.METERS);
}

export function kilometers(value: number): Distance {
    return new Distance(value, Unit.KILOMETERS);
}

export function feet(value: number): Distance {
    return new Distance(value, Unit.FEET);
}

export function yards(value: number): Distance {
    return new Distance(value, Unit.YARDS);
}

export function miles(value: number): Distance {
    return new Distance(value, Unit.MILES);
}

export function nauticalMiles(value: number): Distance {
    return new Distance(value, Unit.NAUTICAL_MILES);
}
