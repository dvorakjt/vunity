export enum MeetingStatus {
    NotInMeeting = 0,
    Authenticating,
    AwaitingUsernameInput,
    ConnectingToSignalingServer,
    WaitingForHost,
    InMeeting,
    Error
}