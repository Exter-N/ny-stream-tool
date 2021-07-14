import { Texture, TextureLoader } from "three";

export function fetchTexture(href: string): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
        const loader = new TextureLoader();
        loader.load(href, resolve, undefined, reject);
    });
}