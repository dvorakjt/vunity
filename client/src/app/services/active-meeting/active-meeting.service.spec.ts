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

    it('should initialize a RemotePeer when handle offer is called.', () => {
        let offer = '{"type":"offer","sdp":"v=0\r\no=mozilla...THIS_IS_SDPARTA-99.0 6386352374598014504 0 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=fingerprint:sha-256 59:61:F1:11:46:BF:43:1B:48:5C:A8:79:9A:83:05:97:7A:D1:0D:63:70:89:1D:F8:EF:87:88:01:03:2A:9D:21\r\na=group:BUNDLE 0 1 2\r\na=ice-options:trickle\r\na=msid-semantic:WMS *\r\nm=audio 9 UDP/TLS/RTP/SAVPF 109 9 0 8 101\r\nc=IN IP4 0.0.0.0\r\na=sendrecv\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:2/recvonly urn:ietf:params:rtp-hdrext:csrc-audio-level\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=fmtp:109 maxplaybackrate=48000;stereo=1;useinbandfec=1\r\na=fmtp:101 0-15\r\na=ice-pwd:bc850420fdcdc67393b14fc8a66928e7\r\na=ice-ufrag:073212cf\r\na=mid:0\r\na=msid:{bfb6d63e-8f4f-472d-8fdb-fff4aa03436d} {1428fb85-f917-496a-857e-835fed70a9e6}\r\na=rtcp-mux\r\na=rtpmap:109 opus/48000/2\r\na=rtpmap:9 G722/8000/1\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:101 telephone-event/8000/1\r\na=setup:actpass\r\na=ssrc:4000403882 cname:{bee7faf7-0f0c-43af-8ace-a49a65a9d708}\r\nm=video 9 UDP/TLS/RTP/SAVPF 120 124 121 125 126 127 97 98\r\nc=IN IP4 0.0.0.0\r\na=sendrecv\r\na=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:4 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:5 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:6/recvonly http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:7 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1\r\na=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1\r\na=fmtp:120 max-fs=12288;max-fr=60\r\na=fmtp:124 apt=120\r\na=fmtp:121 max-fs=12288;max-fr=60\r\na=fmtp:125 apt=121\r\na=fmtp:127 apt=126\r\na=fmtp:98 apt=97\r\na=ice-pwd:bc850420fdcdc67393b14fc8a66928e7\r\na=ice-ufrag:073212cf\r\na=mid:1\r\na=msid:{bfb6d63e-8f4f-472d-8fdb-fff4aa03436d} {855091cd-85b6-40c3-bc29-354c560b5da1}\r\na=rtcp-fb:120 nack\r\na=rtcp-fb:120 nack pli\r\na=rtcp-fb:120 ccm fir\r\na=rtcp-fb:120 goog-remb\r\na=rtcp-fb:120 transport-cc\r\na=rtcp-fb:121 nack\r\na=rtcp-fb:121 nack pli\r\na=rtcp-fb:121 ccm fir\r\na=rtcp-fb:121 goog-remb\r\na=rtcp-fb:121 transport-cc\r\na=rtcp-fb:126 nack\r\na=rtcp-fb:126 nack pli\r\na=rtcp-fb:126 ccm fir\r\na=rtcp-fb:126 goog-remb\r\na=rtcp-fb:126 transport-cc\r\na=rtcp-fb:97 nack\r\na=rtcp-fb:97 nack pli\r\na=rtcp-fb:97 ccm fir\r\na=rtcp-fb:97 goog-remb\r\na=rtcp-fb:97 transport-cc\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:120 VP8/90000\r\na=rtpmap:124 rtx/90000\r\na=rtpmap:121 VP9/90000\r\na=rtpmap:125 rtx/90000\r\na=rtpmap:126 H264/90000\r\na=rtpmap:127 rtx/90000\r\na=rtpmap:97 H264/90000\r\na=rtpmap:98 rtx/90000\r\na=setup:actpass\r\na=ssrc:1589685122 cname:{bee7faf7-0f0c-43af-8ace-a49a65a9d708}\r\na=ssrc:1103256191 cname:{bee7faf7-0f0c-43af-8ace-a49a65a9d708}\r\na=ssrc-group:FID 1589685122 1103256191\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=sendrecv\r\na=ice-pwd:bc850420fdcdc67393b14fc8a66928e7\r\na=ice-ufrag:073212cf\r\na=mid:2\r\na=setup:actpass\r\na=sctp-port:5000\r\na=max-message-size:1073741823\r\n"}'
        offer = offer.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
        service.createLocalPeer("host");
        if(service.localPeer) service.localPeer.stream = new MediaStream();
        service.speakingPeer = service.localPeer;
        const data = {
            from: 'someWebSocketSessionID',
            username: 'Anna',
            offer
        }
        spyOn(service.remotePeerJoinedOrLeft, 'emit');
        spyOn(service, 'subscribeToRemotePeerEvents');
        service.handleOffer(data);
        expect(service.remotePeerList.length).toBe(1);
        expect(service.remotePeersById['someWebSocketSessionID']).toBeTruthy();
        expect(service.speakingPeer).toEqual(service.remotePeersById['someWebSocketSessionID']);
        expect(service.remotePeerJoinedOrLeft.emit).toHaveBeenCalled();
        expect(service.subscribeToRemotePeerEvents).toHaveBeenCalledWith(service.remotePeersById['someWebSocketSessionID']);
    });

    it('should subscribe to a RemotePeer\'s events when subscribeToRemotePeerEvents is called.', () => {
        const remotePeer = new RemotePeer("1234", "remotePeer", new RTCPeerConnection());
        spyOn(remotePeer.signalingEventEmitter, 'subscribe');
        spyOn(remotePeer.mediaStatusRequestEventEmitter, 'subscribe');
        spyOn(remotePeer.chatMessageEventEmitter, 'subscribe');
        spyOn(remotePeer.speechEventEmitter, 'subscribe');
        service.subscribeToRemotePeerEvents(remotePeer);
        expect(remotePeer.signalingEventEmitter.subscribe).toHaveBeenCalled();
        expect(remotePeer.mediaStatusRequestEventEmitter.subscribe).toHaveBeenCalled();
        expect(remotePeer.chatMessageEventEmitter.subscribe).toHaveBeenCalled();
        expect(remotePeer.speechEventEmitter.subscribe).toHaveBeenCalled();
    });
});