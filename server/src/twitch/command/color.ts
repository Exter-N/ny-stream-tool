import cssColorNames from 'css-color-names';
import { rgb2lab } from '../../../../util/rgb-lab';
import settings from '../../settings';
import Transition from '../../transition';
import { setSettings } from '../../ws';

const chromaTransition = new Transition(30, (progress, fromA: number, toA: number, fromB: number, toB: number) => {
    const isLinear = Math.abs((fromA * toB) - (fromB * toA)) < 1;
    const mix = progress * progress * (3 - 2 * progress);
    if (isLinear) {
        const a = (1 - mix) * fromA + mix * toA;
        const b = (1 - mix) * fromB + mix * toB;
        setSettings(null, {
            chromaA: a,
            chromaB: b,
        });
    } else {
        const fromRho = (fromA * fromA + fromB * fromB) ** 0.5;
        const fromTheta = Math.atan2(fromB, fromA);
        const toRho = (toA * toA + toB * toB) ** 0.5;
        let toTheta = Math.atan2(toB, toA);
        if (toTheta - fromTheta > Math.PI) {
            toTheta -= 2 * Math.PI;
        } else if (toTheta - fromTheta < -Math.PI) {
            toTheta += 2 * Math.PI;
        }
        const rho = (1 - mix) * fromRho + mix * toRho;
        const theta = (1 - mix) * fromTheta + mix * toTheta;
        const a = rho * Math.cos(theta);
        const b = rho * Math.sin(theta);
        setSettings(null, {
            chromaA: a,
            chromaB: b,
        });
    }
});

export function startChromaTransition(a: number, b: number): boolean {
    const fromA = (settings.chromaA ?? 0) as number;
    const fromB = (settings.chromaB ?? 0) as number;

    if (fromA === a && fromB === b) {
        return false;
    }

    chromaTransition.start(fromA, a, fromB, b);

    return true;
}

export function handleColor(words: string[]): boolean {
    switch (words.length) {
        case 1:
            {
                let color = words[0];
                if (cssColorNames.hasOwnProperty(color.toLowerCase())) {
                    color = cssColorNames[color.toLowerCase()];
                }
                color = color.replace(/^#/, '');
                if (!/^[0-9A-Fa-f]{3,6}$/.test(color)) {
                    return false;
                }
                const rgb = parseInt(color, 16);
                let red: number, green: number, blue: number;
                switch (color.length) {
                    case 3:
                        red = ((rgb & 0xF00) >> 8) / 0xF;
                        green = ((rgb & 0xF0) >> 4) / 0xF;
                        blue = (rgb & 0xF) / 0xF;
                        break;
                    case 6:
                        red = ((rgb & 0xFF0000) >> 16) / 0xFF;
                        green = ((rgb & 0xFF00) >> 8) / 0xFF;
                        blue = (rgb & 0xFF) / 0xFF;
                        break;
                    default:
                        return false;
                }
                const [, a, b] = rgb2lab([red, green, blue]);
                const maxAmp = Math.max(50, Math.abs(a), Math.abs(b));

                return startChromaTransition(a * 50 / maxAmp, b * 50 / maxAmp);
            }
        case 2:
            {
                const a = Number(words[0]), b = Number(words[1]);
                if (a >= -50 && a <= 50 && b >= -50 && b <= 50) {
                    return startChromaTransition(a, b);
                } else {
                    return false;
                }
            }
        default:
            return false;
    }
}