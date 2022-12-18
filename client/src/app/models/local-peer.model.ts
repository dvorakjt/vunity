import { Subject } from "rxjs";
import * as hark from "hark";
import { DataChannelMessage } from "../types/data-channel-message.type";
import { Peer } from "./peer.model";

export class LocalPeer extends Peer {

    public gain = 1;
    private audioContext = new AudioContext();
    private gainController?:GainNode;
    private mediaStreamSource?:MediaStreamAudioSourceNode;
    private mediaStreamDestination?:MediaStreamAudioDestinationNode;
 
    public dataChannelEventEmitter = new Subject<DataChannelMessage>();

    constructor(username:string) {
        super(username);
        this.audioEnabled = false;
        this.videoEnabled = true;
    }

    getMedia() {
        return new Promise<void>((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then((stream: MediaStream) => {
                const videoTracks = stream.getVideoTracks();
                this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
                this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
                this.gainController = this.audioContext.createGain();
                if(this.gainController && this.mediaStreamSource && this.mediaStreamDestination) {
                    this.mediaStreamSource.connect(this.gainController);
                    this.gainController.connect(this.mediaStreamDestination);
                    this.stream = this.mediaStreamDestination.stream;
                    for(const videoTrack of videoTracks) {
                        this.stream.addTrack(videoTrack);
                    }
                } else this.stream = stream;
                //start with audio muted
                for(const audioTrack of this.stream.getAudioTracks()) audioTrack.enabled = false;
                this.speechListener = hark(this.stream, {});
                this.speechListener.on('speaking', () => {
                    this.speechEventEmitter.next(true);
                });
                this.speechListener.on('stopped_speaking', () => {
                    this.speechEventEmitter.next(false);
                });
                resolve();
            })
            .catch((e) => {
                reject(e);
            });
        })
    }

    releaseMedia() {
        if(this.mediaStreamSource) {
            for(const track of this.mediaStreamSource?.mediaStream.getTracks()) {
                track.stop();
            }
        }
        if(this.stream) {
            for(const track of this.stream.getTracks()) {
                track.stop();
            }
        }
    }

    setAudioEnabled(audioEnabled:boolean) {
        if(this.stream) {
            for(const audioTrack of this.stream.getAudioTracks()) {
                audioTrack.enabled = audioEnabled;
            }
            this.audioEnabled = audioEnabled;
            this.dataChannelEventEmitter.next({
                messageType: 'microphoneToggle',
                message: this.audioEnabled
            });
        }
    }

    setVideoEnabled(videoEnabled:boolean) {
        if(this.stream) {
            for(const videoTrack of this.stream.getVideoTracks()) {
                videoTrack.enabled = videoEnabled;
            }
            this.videoEnabled = videoEnabled;
            this.dataChannelEventEmitter.next({
                messageType: 'videoToggle',
                message: this.videoEnabled
            });
        }
    }

    setGain(newGain:number) {
        if(newGain < 0) newGain = 0;
        if(newGain > 1.5) newGain = 1.5;
        if(this.gainController) {
            this.gain = newGain;
            this.gainController.gain.setTargetAtTime(newGain, this.audioContext.currentTime, 0.015);
        }
    }
}