package link.vunity.vunityapp.ratelimit;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.HandlerInterceptor;

import io.github.bucket4j.Bucket;

@Service
public class RateLimitingInterceptor implements HandlerInterceptor {

    @Autowired
    RateLimitingCache rateLimitingCache;
    
    private static final String[] POSSIBLE_IP_ADDRESS_HEADERS = {
        "X-Forwarded-For",
        "Proxy-Client-IP",
        "WL-Proxy-Client-IP",
        "HTTP_X_FORWARDED_FOR",
        "HTTP_X_FORWARDED",
        "HTTP_X_CLUSTER_CLIENT_IP",
        "HTTP_CLIENT_IP",
        "HTTP_FORWARDED_FOR",
        "HTTP_FORWARDED",
        "HTTP_VIA",
        "REMOTE_ADDR" };


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String IP = getClientIpAddress(request);
        System.out.println("IP detected!");
        System.out.println(IP);
        Bucket bucket = rateLimitingCache.getBucket(IP);
        boolean belowRateLimit = bucket.tryConsume(1);
        if(belowRateLimit) return true;
        else {
            response.sendError(429, "TOO MANY REQUESTS");
            return false;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        for (String header : POSSIBLE_IP_ADDRESS_HEADERS) {
            String ip = request.getHeader(header);
            if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
                return ip;
            }
        }
        
        return request.getRemoteAddr();
    }
}
