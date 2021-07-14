const href = new URL(location.href);

export function makeAbsolute(relative: string, from?: string): URL {
    return new URL(relative, from ?? href);
}