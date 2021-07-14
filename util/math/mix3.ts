import { Vector3 } from "three";
import { mix } from "./mix";

export function mix3(x: Vector3, y: Vector3, a: number, out?: Vector3): Vector3 {
    if (null != out) {
        out.set(mix(x.x, y.x, a), mix(x.y, y.y, a), mix(x.z, y.z, a));

        return out;
    }

    return new Vector3(mix(x.x, y.x, a), mix(x.y, y.y, a), mix(x.z, y.z, a));
}