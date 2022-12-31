export class GuestAuthError extends Error {
    constructor(message:string) {
        super(message);
        this.name = 'GuestAuthError';
    }
}