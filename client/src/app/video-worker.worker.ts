/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const mediaStream = data;

    const audioTracks = mediaStream.getAudioTracks();
    const videoTracks = mediaStream.getVideoTracks();

    let audioTrackStatus = checkTrackStatus(audioTracks);
    let videoTrackStatus = checkTrackStatus(videoTracks);

    setTimeout(() => {
        let newAudioTrackStatus = checkTrackStatus(audioTracks);
        let newVideoTrackStatus = checkTrackStatus(videoTracks);
        if(newAudioTrackStatus != audioTrackStatus || newVideoTrackStatus != videoTrackStatus) {
            audioTrackStatus = newAudioTrackStatus;
            videoTrackStatus = newVideoTrackStatus;
            postMessage({
                audioTrackStatus,
                videoTrackStatus
            });
        }
    }, 100);
});

function checkTrackStatus (mediaTracks:any[]) {
  let mediaTrackEnabled = false;
  mediaTracks.forEach(track => {
      if(track.enabled) mediaTrackEnabled = true;
  });
  return mediaTrackEnabled;
}
