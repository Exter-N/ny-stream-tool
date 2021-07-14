import { Vector2 } from "three";
import { mix } from "./mix";

export function mix2(x: Vector2, y: Vector2, a: number, out?: Vector2): Vector2 {
    if (null != out) {
        out.set(mix(x.x, y.x, a), mix(x.y, y.y, a));

        return out;
    }

    return new Vector2(mix(x.x, y.x, a), mix(x.y, y.y, a));
}