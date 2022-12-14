import { Participant } from "./participant.type";

export type JoinResponse = {
    preexistingParticipants:Participant[];
    isOpen:boolean;
}