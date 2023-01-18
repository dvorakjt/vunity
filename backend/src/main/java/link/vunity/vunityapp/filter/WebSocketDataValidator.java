package link.vunity.vunityapp.filter;

import java.util.Map;

public class WebSocketDataValidator {
    public static boolean isValidatePacket(Map<String, Object> payload) {
        if(payload.keySet().contains("intent")) {
            String intent = payload.get("intent").toString();
            switch(intent) {
                case "join" : 
                  if(payload.keySet().contains("username")) return true;
                  break;
                case "offer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("offer")) return true;
                  break;
                case "answer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("answer")) return true;
                  break;
                case "candidate" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("candidate")) return true;
                  break;
                case "open" :
                  if(payload.keySet().contains("username")) return true;
                  break;
                case "leave" :
                  return true;
                case "close" :
                  return true;
                case "shareScreen" :
                  return true;
                case "offer-screenSharer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("offer")) return true;
                  break;
                case "answer-screenViewer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("answer")) return true;
                  break;
                case "candidate-screenSharer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("candidate")) return true;
                  break;
                case "candidate-screenViewer" :
                  if(payload.keySet().contains("to") && payload.keySet().contains("candidate")) return true;
                  break;
                case "stopSharingScreen" :
                  return true;
                case "pong" :
                  return true;
            }
        }
        return false;
    }
}
