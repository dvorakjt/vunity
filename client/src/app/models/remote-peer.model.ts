import { ReplaySubject, Subject } from "rxjs";
import { Message } from "./message.model";
import { Peer } from "./peer.model";
import { RemotePeerPartial } from "./remote-peer-partial.model";

export class RemotePeer extends Peer {
    sessionId:string;
    connection:RTCPeerConnection;
    dataChannel?:RTCDataChannel;

    public signalingEventEmitter = new ReplaySubject<Object>(1);
    public chatMessageEventEmitter = new Subject<Message>();
    public mediaStatusRequestEventEmitter = new Subject<void>();

    constructor(sessionId:string, username:string, connection:RTCPeerConnection) {
        super(username);

        this.sessionId = sessionId;
        this.connection = connection;
    }

    public static initiateRemoteConnection(remotePeerPartial:RemotePeerPartial, localStream:MediaStream) {
        const remotePeer = new RemotePeer(remotePeerPartial.sessionId, remotePeerPartial.username, remotePeerPartial.connection);
        remotePeer.dataChannel = remotePeer.connection.createDataChannel('dataChannel-' + remotePeer.sessionId);
        localStream.getTracks().forEach(track => {
            remotePeer.connection.addTrack(track, localStream);
        });
        remotePeer.dataChannel.onmessage = remotePeer.onMessage;

        remotePeer.dataChannel.onopen = () => {
            remotePeer.requestMediaEnabledStatus();
        }

        remotePeer.connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remotePeer.stream = remoteStream;
        });

        remotePeer.connection.onicecandidate = remotePeer.onIceCandidate;

        return remotePeer;
    }

    public static createRemoteConnectionFromOffer(sessionId:string, username:string, connection:RTCPeerConnection, offer:RTCSessionDescription, localStream:MediaStream) {
        const remotePeer = new RemotePeer(sessionId, username, connection);
        
        remotePeer.connection.onicecandidate = remotePeer.onIceCandidate;
        
        remotePeer.connection.ondatachannel = (event: RTCDataChannelEvent) => {
            remotePeer.dataChannel = event.channel;
            remotePeer.dataChannel.onmessage = remotePeer.onMessage;
            remotePeer.requestMediaEnabledStatus();
        }

        localStream.getTracks().forEach(track => {
            remotePeer.connection.addTrack(track, localStream);
        });

        remotePeer.connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remotePeer.stream = remoteStream;
        });

        return remotePeer;
    }

    private onMessage(messageEvent: MessageEvent) {
        const data = JSON.parse(messageEvent.data);
        if(data.messageType === 'chat') {
            const message = new Message(data.message, this.username);
            this.chatMessageEventEmitter.next(message);
        } else if(data.messageType === 'microphoneToggle') {
            this.audioEnabled = data.message;
            
        } else if(data.messageType === 'videoToggle') {
            this.videoEnabled = data.message;
        } else if(data.messageType === 'requestMediaEnabledStatus') {
            this.mediaStatusRequestEventEmitter.next();
        } else if(data.messageType === 'mediaEnabledStatus') {
            const {audioEnabled, videoEnabled} = data.message;
            this.audioEnabled = audioEnabled;
            this.videoEnabled = videoEnabled;
        }
    }

    private onIceCandidate(event: RTCPeerConnectionIceEvent) {
        if (event.candidate) {
            const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
            const signalingEventObject = {
                intent: 'candidate',
                to: this.sessionId,
                candidate
            }
            this.signalingEventEmitter.next(signalingEventObject)
        }
    }

    public createOffer() {
        this.connection.createOffer().then((offer) => {
            this.connection.setLocalDescription(offer);
            const signalingEventObject = {
                intent: 'offer',
                to: this.sessionId,
                offer: JSON.stringify(new RTCSessionDescription(offer).toJSON()),
                username: this.username
            }
            this.signalingEventEmitter.next(signalingEventObject);
        }).catch((e) => {
            throw new Error("Failed to create offer for remote peer " + this.sessionId);
        });
    }

    public createAnswer() {
        this.connection.createAnswer().then(answer => {
            this.connection.setLocalDescription(answer);
            const signalingEventObject = {
                intent: 'answer',
                to: this.sessionId,
                answer: JSON.stringify(new RTCSessionDescription(answer).toJSON())
            }
            this.signalingEventEmitter.next(signalingEventObject);
        }).catch(e => {
            throw new Error("Failed to create answer for remote peer " + this.sessionId);
        });
    }

    private requestMediaEnabledStatus() {
        const messageObject = {
            messageType: 'requestMediaEnabledStatus',
            message: ''
        }
        const messageString = JSON.stringify(messageObject);
        this.dataChannel?.send(messageString);
    }
}