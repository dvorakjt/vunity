export enum MeetingStatus {
    NotInMeeting = 0,
    Authenticating,
    AwaitingUsernameInput,
    AwaitingMedia,
    AwaitingMediaSettings,
    ReadyToJoin,
    ConnectingToSignalingServer,
    WaitingForHost,
    InMeeting,
    Error
}