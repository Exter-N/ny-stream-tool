export default class PublicError extends Error { }

export class PublicAccessDeniedError extends PublicError {
    constructor(message?: string) {
        super(message ?? 'Pas touche !');
    }
}