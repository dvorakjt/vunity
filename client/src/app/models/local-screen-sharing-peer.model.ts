import {Peer} from './peer.model';

export class LocalScreenSharingPeer extends Peer {
    constructor(username:string) {
        super(username);
        this.videoEnabled = true;
    }
}