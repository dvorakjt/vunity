package link.vunity.vunityapp.ratelimit;

import java.time.Duration;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Component;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Component
public class RateLimitingCache {
    //something like this, will have to decide on actual rate limits and size...
    private Cache<String, Bucket> bucketsByIPAddress = CacheBuilder.newBuilder().maximumSize(10000).expireAfterWrite(Duration.ofHours(24)).build();

    public Bucket getBucket(String IP) throws ExecutionException {
        Bucket bucket = bucketsByIPAddress.get(IP, () -> initializeBucket());
        return bucket;
    }

    private Bucket initializeBucket() {
        Refill burstRefill = Refill.intervally(45, Duration.ofMinutes(1));
        Refill slowRefill = Refill.intervally(5000, Duration.ofDays(1));
        Bandwidth burstLimit = Bandwidth.classic(30, burstRefill);
        Bandwidth slowLimit = Bandwidth.classic(5000, slowRefill);
        Bucket bucket = Bucket.builder()
            .addLimit(burstLimit)
            .addLimit(slowLimit)
            .build();
        return bucket;
    }
}
