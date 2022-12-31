export enum MeetingStatus {
    NotInMeeting = 0,
    AwaitingUsernameInput,
    AwaitingMedia,
    AwaitingMediaSettings,
    ReadyToJoin,
    ConnectingToSignalingServer,
    WaitingForHost,
    InMeeting,
    Error
}