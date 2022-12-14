export abstract class Peer {
    username:string;
    stream?:MediaStream;
    audioEnabled?:boolean;
    videoEnabled?:boolean;

    constructor(username:string) {
        this.username = username;
    }
}