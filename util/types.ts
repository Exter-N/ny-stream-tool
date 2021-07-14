export type Array2<T> = [T, T];
export type Array3<T> = [T, T, T];
export type Array4<T> = [T, T, T, T];
export type Array5<T> = [T, T, T, T, T];

export type BasicMap<T> = { [K: string]: T; };

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;