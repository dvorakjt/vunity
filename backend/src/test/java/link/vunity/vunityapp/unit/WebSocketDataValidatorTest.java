package link.vunity.vunityapp.unit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import link.vunity.vunityapp.filter.WebSocketDataValidator;

public class WebSocketDataValidatorTest {
    private Map<String, Object> payload;

    @BeforeEach
    public void refreshPayload() {
        payload = new HashMap<String, Object>();
    }

    @Test
    public void isValidatePacketShouldBeFalseForPacketsWithoutIntent() {
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForPacketsWithInvalidIntent() {
        payload.put("intent", "TAKE OVER THE WORLD, PINKY!");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForJoinPacketWithoutUsername() {
        payload.put("intent", "join");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }
    
    @Test
    public void isValidatePacketShouldBeTrueForJoinPacketWithUsername() {
        payload.put("intent", "join");
        payload.put("username", "steve");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForOfferPacketWithoutTo() {
        payload.put("intent", "offer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForOfferPacketWithoutOffer() {
        payload.put("intent", "offer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForOfferPacketWithToAndOffer() {
        payload.put("intent", "offer");
        payload.put("to", "some other user");
        payload.put("offer", "RTC Offer");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForAnswerPacketWithoutTo() {
        payload.put("intent", "answer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForAnswerPacketWithoutAnswer() {
        payload.put("intent", "answer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForAnswerPacketWithToAndAnswer() {
        payload.put("intent", "answer");
        payload.put("to", "some other user");
        payload.put("answer", "RTC Answer");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForCandidatePacketWithoutTo() {
        payload.put("intent", "candidate");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForCandidatePacketWithoutCandidate() {
        payload.put("intent", "candidate");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForCandidatePacketWithToAndCandidate() {
        payload.put("intent", "candidate");
        payload.put("to", "some other user");
        payload.put("candidate", "RTC Candidate");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForOpenPacketWithoutUsername() {
        payload.put("intent", "open");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }
    
    @Test
    public void isValidatePacketShouldBeTrueForOpenPacketWithUsername() {
        payload.put("intent", "open");
        payload.put("username", "steve");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForPacketWithIntentOfLeave() {
        payload.put("intent", "leave");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForPacketWithIntentOfClose() {
        payload.put("intent", "close");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForPacketWithIntentOfShareScreen() {
        payload.put("intent", "shareScreen");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenSharerOfferPacketWithoutTo() {
        payload.put("intent", "offer-screenSharer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenSharerOfferPacketWithoutOffer() {
        payload.put("intent", "offer-screenSharer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForScreenSharerOfferPacketWithToAndOffer() {
        payload.put("intent", "offer-screenSharer");
        payload.put("to", "some other user");
        payload.put("offer", "RTC Offer");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenViewerAnswerPacketWithoutTo() {
        payload.put("intent", "answer-screenViewer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenViewerAnswerPacketWithoutAnswer() {
        payload.put("intent", "answer-screenViewer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForScreenViewerAnswerPacketWithToAndAnswer() {
        payload.put("intent", "answer-screenViewer");
        payload.put("to", "some other user");
        payload.put("answer", "RTC Answer");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenSharerCandidatePacketWithoutTo() {
        payload.put("intent", "candidate-screenSharer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenSharerCandidatePacketWithoutCandidate() {
        payload.put("intent", "candidate-screenSharer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForScreenSharerCandidatePacketWithToAndCandidate() {
        payload.put("intent", "candidate-screenSharer");
        payload.put("to", "some other user");
        payload.put("candidate", "RTC Candidate");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenViewerCandidatePacketWithoutTo() {
        payload.put("intent", "candidate-screenViewer");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeFalseForScreenViewerCandidatePacketWithoutCandidate() {
        payload.put("intent", "candidate-screenViewer");
        payload.put("to", "some other user");
        assertFalse(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForScreenViewerCandidatePacketWithToAndCandidate() {
        payload.put("intent", "candidate-screenViewer");
        payload.put("to", "some other user");
        payload.put("candidate", "RTC Candidate");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }

    @Test
    public void isValidatePacketShouldBeTrueForPacketWithIntentOfStopSharingScreen() {
        payload.put("intent", "stopSharingScreen");
        assertTrue(WebSocketDataValidator.isValidatePacket(payload));
    }
}
