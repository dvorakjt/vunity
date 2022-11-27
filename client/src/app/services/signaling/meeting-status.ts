export enum MeetingStatus {
    NotInMeeting = 0,
    Authenticating,
    ConnectingToSignalingServer,
    WaitingForHost,
    InMeeting,
    Error
}