export class HostAuthError extends Error {
    constructor(message:string) {
        super(message);
        this.name = 'HostAuthError';
    }
}