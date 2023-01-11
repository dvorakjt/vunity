import { EventEmitter } from "@angular/core";
import { Message } from "@stomp/stompjs";
import { ReplaySubject, of } from "rxjs";
import { MeetingStatus } from "src/app/constants/meeting-status";
import { LocalPeer } from "src/app/models/local-peer.model";
import { Peer } from "src/app/models/peer.model";
import { RemotePeerPartial } from "src/app/models/remote-peer-partial.model";
import { RemotePeer } from "src/app/models/remote-peer.model";
import { RemotePeerMap } from "src/app/types/remote-peer-map.type";
import { ScreenViewerMap } from "src/app/types/screen-viewer-map.type";

export class ActiveMeetingServiceStub {

    public isHost = false;
    public localPeer?:LocalPeer;
    public remotePeerList:RemotePeer[] = [];
    public remotePeersById:RemotePeerMap = {};

    public isSharingScreen = false;
    public screenSharingStream?:MediaStream;
    public screenSharingPeer?:Peer;
    public screenViewersById:ScreenViewerMap = {};

    public speakingPeer?:Peer;

    public messages:Message[] = [];
    public newChatMessageReceived = new EventEmitter<void>();

    public meetingStatus: MeetingStatus = MeetingStatus.NotInMeeting;
    public meetingStatusChanged = new EventEmitter<MeetingStatus>(); 
    public errorEmitter = new EventEmitter<Error>();

    public remotePeerJoinedOrLeft = new EventEmitter<void>();

    authenticateAsGuest(meetingId:string, password:string) {
    }

    authenticateAsHost(meetingId:string) {
    }

    public setLocalPeerUsername(username:string) {
    }

    private createLocalPeer(username:string) {
    }

    public getLocalMedia() {
    }

    public setLocalAudioEnabled(audioEnabled:boolean) {
    }

    public setLocalVideoEnabled(videoEnabled:boolean) {
    }

    public confirmMediaSettings() {
    }

    private join() {
    }

    private open() {
    }

    public shareScreen() {
    }

    public stopScreenShare() {
    }

    public leave() {
    }

    public close() {
    }

    public resetMeetingData() {
    }

    public broadcastMessage(type:string, message:string) {}
}