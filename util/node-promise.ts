export function nPromise<T>(fn: (callback: (err: any, result: T | PromiseLike<T>) => void) => void) {
    return new Promise<T>((resolve, reject) => {
        fn((err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export function nPromiseMulti<T extends any[]>(fn: (callback: (err: any, ...result: T) => void) => void) {
    return new Promise<T>((resolve, reject) => {
        fn((err, ...result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}