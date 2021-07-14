import { deserialize } from "bson";

export async function fetchJson<T>(resource: string | Request, init?: RequestInit): Promise<T> {
    const url = (resource instanceof Request) ? resource.url : resource;
    const response = await fetch(resource, init);
    const extension = url.match(/\.([0-9a-z]+)$/i)?.[1]?.toLowerCase();
    switch (extension) {
        case "bson":
            return deserialize(await response.arrayBuffer()) as T;
        default:
            return (await response.json()) as T;
    }
}