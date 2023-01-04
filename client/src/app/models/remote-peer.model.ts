import { ReplaySubject, Subject } from "rxjs";
import hark from 'hark';
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

        remotePeer.dataChannel.onmessage = (messageEvent: MessageEvent) => {
            const data = JSON.parse(messageEvent.data);
            console.log(data);
            if(data.messageType === 'chat') {
                const message = new Message(data.message, remotePeer.username);
                remotePeer.chatMessageEventEmitter.next(message);
            } else if(data.messageType === 'microphoneToggle') {
                remotePeer.audioEnabled = data.message;
                remotePeer.audioToggled.next();
            } else if(data.messageType === 'videoToggle') {
                remotePeer.videoEnabled = data.message;
                remotePeer.videoToggled.next();
            } else if(data.messageType === 'requestMediaEnabledStatus') {
                remotePeer.mediaStatusRequestEventEmitter.next();
            } else if(data.messageType === 'mediaEnabledStatus') {
                const {audioEnabled, videoEnabled} = data.message;
                remotePeer.audioEnabled = audioEnabled;
                remotePeer.videoEnabled = videoEnabled;
                remotePeer.audioToggled.next();
            }
        }

        remotePeer.dataChannel.onopen = () => {
            remotePeer.requestMediaEnabledStatus();
        }

        remotePeer.connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remotePeer.stream = remoteStream;
            remotePeer.speechListener = hark(remotePeer.stream, {});
            remotePeer.speechListener.on('speaking', () => {
                remotePeer.speechEventEmitter.next(true);
            });
            remotePeer.speechListener.on('stopped_speaking', () => {
                remotePeer.speechEventEmitter.next(false);
            });
        });

        remotePeer.connection.onicecandidate = remotePeer.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                const signalingEventObject = {
                    intent: 'candidate',
                    to: remotePeer.sessionId,
                    candidate
                }
                remotePeer.signalingEventEmitter.next(signalingEventObject);
            }
        }

        return remotePeer;
    }

    public static createRemoteConnectionFromOffer(sessionId:string, username:string, connection:RTCPeerConnection, offer:RTCSessionDescription, localStream:MediaStream) {
        const remotePeer = new RemotePeer(sessionId, username, connection);

        remotePeer.connection.setRemoteDescription(offer);
        
        remotePeer.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                const signalingEventObject = {
                    intent: 'candidate',
                    to: remotePeer.sessionId,
                    candidate
                }
                remotePeer.signalingEventEmitter.next(signalingEventObject);
            }
        }
        
        remotePeer.connection.ondatachannel = (event: RTCDataChannelEvent) => {
            remotePeer.dataChannel = event.channel;
            remotePeer.dataChannel.onmessage = (messageEvent: MessageEvent) => {
                const data = JSON.parse(messageEvent.data);
                console.log(data);
                if(data.messageType === 'chat') {
                    const message = new Message(data.message, remotePeer.username);
                    remotePeer.chatMessageEventEmitter.next(message);
                } else if(data.messageType === 'microphoneToggle') {
                    remotePeer.audioEnabled = data.message;
                    remotePeer.audioToggled.next();
                } else if(data.messageType === 'videoToggle') {
                    remotePeer.videoEnabled = data.message;
                    remotePeer.videoToggled.next();
                } else if(data.messageType === 'requestMediaEnabledStatus') {
                    remotePeer.mediaStatusRequestEventEmitter.next();
                } else if(data.messageType === 'mediaEnabledStatus') {
                    const {audioEnabled, videoEnabled} = data.message;
                    remotePeer.audioEnabled = audioEnabled;
                    remotePeer.videoEnabled = videoEnabled;
                    remotePeer.audioToggled.next();
                }
            }
            remotePeer.requestMediaEnabledStatus();
        }

        localStream.getTracks().forEach(track => {
            remotePeer.connection.addTrack(track, localStream);
        });

        remotePeer.connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            remotePeer.stream = remoteStream;
            remotePeer.speechListener = hark(remotePeer.stream, {});
            remotePeer.speechListener.on('speaking', () => {
                remotePeer.speechEventEmitter.next(true);
            });
            remotePeer.speechListener.on('stopped_speaking', () => {
                remotePeer.speechEventEmitter.next(false);
            });
        });

        return remotePeer;
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