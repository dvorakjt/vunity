import { HttpClient } from "@angular/common/http";
import { fakeAsync, tick } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { MeetingStatus } from "src/app/constants/meeting-status";
import { LocalPeer } from "src/app/models/local-peer.model";
import { Message } from "src/app/models/message.model";
import { RemotePeerPartial } from "src/app/models/remote-peer-partial.model";
import { RemotePeer } from "src/app/models/remote-peer.model";
import { AuthServiceStub } from "src/app/tests/mocks/AuthServiceStub";
import { HttpClientStub } from "src/app/tests/mocks/HttpClientStub";
import { AuthService } from "../auth/auth.service";
import { ActiveMeetingService } from "./active-meeting.service";
import { GuestAuthError } from "./errors/guest-auth-error";
import { HostAuthError } from "./errors/host-auth-error";

describe('ActiveMeetingService', () => {
    let service:ActiveMeetingService;

    beforeEach(() => {
        service = new ActiveMeetingService((new AuthServiceStub() as any) as AuthService, new HttpClientStub() as HttpClient);
    });

    it('should set authToken and call updateMeetingStatus when authenticateAsGuest succeeds.', () => {
        spyOn(service.http, 'post').and.returnValue(of({access_token:'meetingJWT'}));
        spyOn(service, 'updateMeetingStatus');
        service.meetingStatus = MeetingStatus.NotInMeeting;
        service.authenticateAsGuest('validMeetingId', 'password', 'recaptchaToken');
        expect(service.authToken).toBe('meetingJWT');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingUsernameInput);
    });

    it('should call handleError with new GuestAuthError if authenticateAsGuest is called while in a meeting.', () => {
        spyOn(service, 'handleError');
        service.meetingStatus = MeetingStatus.InMeeting;
        service.authenticateAsGuest('1234', 'password', 'recaptchaToken');
        expect(service.handleError).toHaveBeenCalledWith(new GuestAuthError('Already in a meeting.'));
    });

    it('should call handleError with new GuestAuthError if http post method fails.', () => {
        spyOn(service.http, 'post').and.returnValue(throwError({status:403}));
        spyOn(service, 'handleError');
        service.meetingStatus = MeetingStatus.NotInMeeting;
        service.authenticateAsGuest('1234', 'wrongPassword', 'recaptchaToken');
        expect(service.handleError).toHaveBeenCalledWith(new GuestAuthError('Failed to join meeting. Please check the id and password.'));
    });

    it('should set isHost to true, authToken, call createLocalPeer, updateMeetingStatus and getLocalMedia when authenticateAsHost post request succeeds and there is an activeUser.', () => {
        spyOn(service.http, 'post').and.returnValue(of({access_token: "meetingJWT"}));
        spyOn(service, 'createLocalPeer');
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'getLocalMedia');
        service.authService.activeUser = {name: 'Host', email: 'host@vunity.com'};
        service.authenticateAsHost('validMeetingId');
        expect(service.isHost).toBeTrue();
        expect(service.authToken).toBe('meetingJWT');
        expect(service.createLocalPeer).toHaveBeenCalledWith('Host');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingMedia);
        expect(service.getLocalMedia).toHaveBeenCalled();
    });

    it('should call handleError with new HostAuthError when authenticateAsHost post request succeeds but activeUser is undefined.', () => {
        spyOn(service.http, 'post').and.returnValue(of({access_token: "meetingJWT"}));
        spyOn(service, 'handleError');
        service.authService.activeUser = undefined;
        service.authenticateAsHost("valid meeting id");
        expect(service.handleError).toHaveBeenCalledWith(new HostAuthError("No active user."));
    });

    it('should call handleError with new HostAuthError when authenticateAsHost is called and the post request fails.', () => {
        spyOn(service.http, 'post').and.returnValue(throwError(() => new Error()))
        spyOn(service, 'handleError');
        service.authenticateAsHost("invalid meeting id");
        expect(service.handleError).toHaveBeenCalledWith(new HostAuthError('Insufficicent permissions.'));
    });

    it('should call handleError with new HostAuthError when authenticateAsHost is called and meetingStatus is anything but NotInMeeting.', () => {
        spyOn(service, 'handleError');
        service.meetingStatus = MeetingStatus.AwaitingMedia;
        service.authenticateAsHost("valid meeting id");
        expect(service.handleError).toHaveBeenCalledWith(new HostAuthError("Already in meeting"));
    });

    it('should call createLocalPeer, updateMeetingStatus and getLocalMedia when setLocalPeerUsername is called.', () => {
        spyOn(service, 'createLocalPeer');
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'getLocalMedia');
        service.setLocalPeerUsername('username');
        expect(service.createLocalPeer).toHaveBeenCalledWith('username');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingMedia);
        expect(service.getLocalMedia).toHaveBeenCalled();
    });

    it('should initialize a local peer when createLocalPeer is called.', () => {
        service.createLocalPeer('username');
        expect(service.localPeer).toBeInstanceOf(LocalPeer);
        expect(service.localPeer?.username).toBe('username');
    });

    it('should call broadcastMessage after createLocalPeer is called when the local peer\'s dataChannelEventEmitter emits an event.', () => {
        service.createLocalPeer('username');
        spyOn(service, 'broadcastMessage');
        service.localPeer?.dataChannelEventEmitter.next({
            messageType : 'foo',
            message : 'bar'
        });
        expect(service.broadcastMessage).toHaveBeenCalledWith('foo', 'bar');
    });

    it('should call updateMeetingStatus with MeetingStatus.AwaitingMediaSettings when getLocalMedia is called while there is a localPeer & localPeer.getMedia() resolves.',
        fakeAsync(() => {
        service.createLocalPeer('username');
        spyOn(service.localPeer as LocalPeer, 'getMedia').and.returnValue(Promise.resolve());
        spyOn(service, 'updateMeetingStatus');

        service.meetingStatus = MeetingStatus.AwaitingMedia;
        service.getLocalMedia();
        tick();
        
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingMediaSettings);
    }));

    it('should call handleError and resetMeetingData when there is a localPeer but localPeer.getMedia() fails.', fakeAsync(() => {
        service.createLocalPeer('username');
        spyOn(service.localPeer as LocalPeer, 'getMedia').and.returnValue(Promise.reject());
        spyOn(service, 'handleError');
        spyOn(service, 'resetMeetingData');
        service.getLocalMedia();
        tick();
        expect(service.handleError).toHaveBeenCalledWith(new Error("User declined to give permissions."));
        expect(service.resetMeetingData).toHaveBeenCalled();
    }));

    it('should call handleError and resetMeetingData when getLocalMedia is called without a localPeer.', () => {
        spyOn(service, 'handleError');
        spyOn(service, 'resetMeetingData');
        service.getLocalMedia();
        expect(service.handleError).toHaveBeenCalledWith(new Error("No local peer was created."));
        expect(service.resetMeetingData).toHaveBeenCalled();
    });

    it('should call localPeer.setAudioEnabled if there is a localPeer when setLocalAudioEnabled is called.', () => {
        service.createLocalPeer('username');
        spyOn(service.localPeer as LocalPeer, 'setAudioEnabled');
        service.setLocalAudioEnabled(true);
        expect(service.localPeer?.setAudioEnabled).toHaveBeenCalledWith(true);
    });

    it('should call localPeer.setVideoEnabled if there is a localPeer when setLocalVideoEnabled is called.', () => {
        service.createLocalPeer('username');
        spyOn(service.localPeer as LocalPeer, 'setVideoEnabled');
        service.setLocalVideoEnabled(true);
        expect(service.localPeer?.setVideoEnabled).toHaveBeenCalledWith(true);
    });

    it('should call updateMeetingStatus with MeetingStatus.ReadyToJoin and then call join() if the user is NOT the host when confirmMediaSettings() is called.', () => {
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'join');
        service.isHost = false;
        service.confirmMediaSettings();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.ReadyToJoin);
        expect(service.join).toHaveBeenCalled();
    });

    it('should call updateMeetingStatus with MeetingStatus.ReadyToJoin and then call open() if the user IS the host when confirmMediaSettings() is called.', () => {
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'open');
        service.isHost = true;
        service.confirmMediaSettings();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.ReadyToJoin);
        expect(service.open).toHaveBeenCalled();
    });

    it('should call updateMeetingStatus, checkAndEstablishWebSocketConnection, updateMeetingStatus and sendOverWebSocket when join() is called.', () => {
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'checkAndEstablishWebSocketConnection');
        spyOn(service, 'sendOverWebSocket');
        service.createLocalPeer('username');
        service.join();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.ConnectingToSignalingServer);
        expect(service.checkAndEstablishWebSocketConnection).toHaveBeenCalled();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.WaitingForHost);
        expect(service.sendOverWebSocket).toHaveBeenCalledWith({
            intent: 'join',
            username: 'username'
        });
    });

    it('should call updateMeetingStatus, checkAndEstablishWebSocketConnection and sendOverWebSocket when open() is called.', () => {
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'checkAndEstablishWebSocketConnection');
        spyOn(service, 'sendOverWebSocket');
        service.createLocalPeer('host');
        service.open();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.ConnectingToSignalingServer);
        expect(service.checkAndEstablishWebSocketConnection).toHaveBeenCalled();
        expect(service.sendOverWebSocket).toHaveBeenCalledWith({
            intent: 'open',
            username: 'host'
        });
    });

    it('should call sendOverWebSocket when shareScreen() is called.', () => {
        spyOn(service, 'sendOverWebSocket');
        service.shareScreen();
        expect(service.sendOverWebSocket).toHaveBeenCalledWith({intent: 'shareScreen'});
    });

    it('should call sendOverWebSocket(), stop all tracks of the screenSharingStream, close all connections in screenViewersById,' + 
    'and reset screenSharingPeer, screenSharingStream, screenViewersById, and isScreenSharing when stopScreenShare is called while sharing screen.', () => {
        service.screenSharingStream = new MediaStream();
        const mediaTracks = [];
        for(let i = 0; i < 5; i++) mediaTracks.push(({stop() {}} as any));
        for(const track of mediaTracks) {
            spyOn(track, 'stop');
        }
        spyOn(service.screenSharingStream, 'getTracks').and.returnValue(mediaTracks);
        spyOn(service, 'sendOverWebSocket');
        service.screenViewersById["1"] = new RemotePeer("1", "username", new RTCPeerConnection());
        const screenViewer = service.screenViewersById["1"];
        spyOn(screenViewer.connection, 'close');

        service.isSharingScreen = true;
        service.stopScreenShare();

        expect(service.sendOverWebSocket).toHaveBeenCalledWith({intent: 'stopSharingScreen'});
        for(const track of mediaTracks) {
            expect(track.stop).toHaveBeenCalled();
        }
        expect(screenViewer.connection.close).toHaveBeenCalled();
        expect(service.screenSharingPeer).toBe(undefined);
        expect(service.screenSharingStream).toBeFalsy();
        expect(service.screenViewersById["1"]).toBeFalsy();
        expect(service.isSharingScreen).toBeFalse();
    });

    it('should call sendOverWebSocket and resetMeetingData() when leave() is called.', () => {
        spyOn(service, 'sendOverWebSocket');
        spyOn(service, 'resetMeetingData');
        service.leave();
        expect(service.sendOverWebSocket).toHaveBeenCalledWith({intent: 'leave'});
        expect(service.resetMeetingData).toHaveBeenCalled();
    });

    it('should call sendOverWebSocket and resetMeetingData() when close() is called.', () => {
        spyOn(service, 'sendOverWebSocket');
        spyOn(service, 'resetMeetingData');
        service.close();
        expect(service.sendOverWebSocket).toHaveBeenCalledWith({intent: 'close'});
        expect(service.resetMeetingData).toHaveBeenCalled();
    });

    it('should close all connections, reset all instance variables, and call updateMeetingStatus when resetMeetingData() is called.', () => {
        //set up
        const peer1 = new RemotePeer("1", "peer1", new RTCPeerConnection());
        service.remotePeerList.push(peer1);
        service.remotePeersById["1"] = peer1;
        service.remotePeerPartials.push(new RemotePeerPartial("1", "peer1", new RTCPeerConnection()));
        service.speakingPeer = peer1;

        const peer2 = new RemotePeer("2", "peer2", new RTCPeerConnection());
        service.screenViewersById["2"] = peer2;

        const peer3 = new RemotePeer("3", "peer3", new RTCPeerConnection());
        service.screenSharingPeer = peer3;

        const peers = [peer1, peer2, peer3];

        service.createLocalPeer('local peer');
        const localPeer = service.localPeer;

        service.screenSharingStream = new MediaStream();
        const mediaTracks = [];
        for(let i = 0; i < 5; i++) mediaTracks.push(({stop() {}} as any));
        spyOn(service.screenSharingStream, 'getTracks').and.returnValue(mediaTracks);

        service.websocketConnection = {close() {}} as any;
        const ws = service.websocketConnection;

        service.isSharingScreen = true;

        service.messages.push(new Message("Hello World", "Host"));

        //spy on functions
        for(const peer of peers) spyOn(peer.connection, 'close');
        spyOn(localPeer as LocalPeer, 'releaseMedia');
        for(const track of mediaTracks) {
            spyOn(track, 'stop');
        }
        spyOn(ws as WebSocket, 'close');
        spyOn(service, 'updateMeetingStatus');

        //call resetMeetingData
        service.resetMeetingData();

        //expect functions to have been called
        for(const peer of peers) expect(peer.connection.close).toHaveBeenCalled();
        expect(localPeer?.releaseMedia).toHaveBeenCalled();
        for(const track of mediaTracks) expect(track.stop).toHaveBeenCalled();
        expect(ws?.close).toHaveBeenCalled();
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.NotInMeeting);

        //expect instance variables to have been reset
        expect(service.isHost).toBeFalse();
        expect(service.authToken).toBe('');
        expect(service.localPeer).toBeFalsy();
        expect(service.remotePeerPartials.length).toBe(0);
        expect(service.remotePeerList.length).toBe(0);
        expect(service.remotePeersById["1"]).toBeUndefined();
        expect(service.isSharingScreen).toBeFalse();
        expect(service.screenSharingStream).toBeUndefined();
        expect(service.screenSharingPeer).toBeUndefined();
        expect(service.screenViewersById["2"]).toBeUndefined();
        expect(service.speakingPeer).toBeUndefined();
        expect(service.messages.length).toBe(0);
    });

    it('should create instances of RemotePeerPartial and push them to remotePeerPartials when handleJoinOrOpenAsHost is called.', () => {
        const data = {
            preexistingParticipants: [
                {sessionId: "1", username: "peer1"},
                {sessionId: "2", username: "peer2"}
            ],
            isOpen : false
        }
        service.meetingStatus = MeetingStatus.ConnectingToSignalingServer;
        service.handleJoinOrOpenAsHost(data);
        expect(service.remotePeerPartials.length).toBe(2);
        expect(service.remotePeerPartials[0].username).toBe("peer1");
        expect(service.remotePeerPartials[0].sessionId).toBe("1");
    });

    it('should call updateMeetingStatus() and openConnections() when handleJoinOrOpenAsHost() is called and data.isOpen is true.', () => {
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'openConnections');
        const data = {
            preexistingParticipants: [],
            isOpen : true
        }
        service.meetingStatus = MeetingStatus.ConnectingToSignalingServer;
        service.handleJoinOrOpenAsHost(data);
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.InMeeting);
        expect(service.openConnections).toHaveBeenCalled();
    });

    it('should call openConnection() on each remotePeerPartial, add the resulting RemotePeer to remotePeerList and remotePeersById,' +
        'set speakingPeer to the first RemotePeer, emit a remotePeerJoinedOrLeft event, call subscribeToRemotePeerEvents and call remotePeer.createOffer' +
        'when openConnections() is called.', () => {
            const peerPartial = new RemotePeerPartial("1", "username", new RTCPeerConnection());
            const remotePeer = new RemotePeer("1", "username", peerPartial.connection);
            service.createLocalPeer("host");
            if(service.localPeer) service.localPeer.stream = new MediaStream();
            service.speakingPeer = service.localPeer;
            service.remotePeerPartials = [peerPartial];

            spyOn(peerPartial, 'openConnection').and.returnValue(remotePeer);
            spyOn(remotePeer, 'createOffer');
            spyOn(service.remotePeerJoinedOrLeft, 'emit');
            spyOn(service, 'subscribeToRemotePeerEvents');

            service.openConnections();

            expect(peerPartial.openConnection).toHaveBeenCalled();
            expect(remotePeer.createOffer).toHaveBeenCalled();
            expect(service.remotePeerJoinedOrLeft.emit).toHaveBeenCalled();
            expect(service.subscribeToRemotePeerEvents).toHaveBeenCalledWith(remotePeer);
            expect(service.speakingPeer).toEqual(remotePeer);
        });
});