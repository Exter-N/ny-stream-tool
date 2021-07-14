import { randomBytes } from 'crypto';

class DiceInternal {
    entropy: number;
    seed: number;
    constructor() {
        this.entropy = 0;
        this.seed = 0;
    }
    addByteToSeed(byte: number): void {
        this.seed += byte * Math.pow(2, this.entropy);
        this.entropy += 8;
    }
    ensureEntropy(minEntropy: number): void {
        const missingBytes = Math.ceil((minEntropy - this.entropy) / 8);
        if (missingBytes <= 0) {
            return;
        }
        if (this.entropy + (missingBytes << 3) > 53) {
            throw new Error('Entropy overflow');
        }
        for (const byte of randomBytes(missingBytes).reverse()) {
            this.addByteToSeed(byte);
        }
    }
    roll(sides: number): number {
        let value;
        const minEntropy = Math.ceil(Math.log2(sides));
        const modulus = Math.pow(2, minEntropy);
        do {
            this.ensureEntropy(minEntropy);
            value = this.seed % modulus;
            this.entropy -= minEntropy;
            this.seed = (this.seed - value) / modulus;
        } while (value >= sides);

        return value + 1;
    }
}

export default class Dice {
    constructor() {
        const internal = new DiceInternal();
        this.roll = internal.roll.bind(internal);
    }
    roll(sides: number): number {
        throw new Error('Cannot call the prototype\'s roll method !');
    }
}