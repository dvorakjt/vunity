import { Peer } from "./peer.model";

export class ScreenSharingPeer extends Peer {
    sessionId:string;
    connection:RTCPeerConnection;
    
    constructor(sessionId:string, username:string, connection:RTCPeerConnection) {
        super(username);
        this.sessionId = sessionId;
        this.connection = connection;
        this.videoEnabled = true;
    }
}