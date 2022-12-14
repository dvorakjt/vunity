import { RemotePeer } from "./remote-peer.model";

export class RemotePeerPartial {
    constructor(public sessionId:string, public username:string, public connection:RTCPeerConnection) {}

    public openConnection(localStream:MediaStream) {
        return RemotePeer.initiateRemoteConnection(this, localStream);
    }
}