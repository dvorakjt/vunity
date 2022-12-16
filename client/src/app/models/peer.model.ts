import { Subject } from "rxjs";
import * as hark from "hark";

export abstract class Peer {
    username:string;
    stream?:MediaStream;
    audioEnabled?:boolean;
    videoEnabled?:boolean;
    audioToggled:Subject<void>;
    videoToggled:Subject<void>;
    public speechListener?:hark.Harker;
    public speechEventEmitter = new Subject<boolean>();

    constructor(username:string) {
        this.username = username;
        this.audioToggled = new Subject<void>();
        this.videoToggled = new Subject<void>();
    }
}