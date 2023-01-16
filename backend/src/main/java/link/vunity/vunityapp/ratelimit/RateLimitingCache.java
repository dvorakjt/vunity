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
    private Cache<String, Bucket> bucketsByIPAddress = CacheBuilder.newBuilder().maximumSize(10000).expireAfterAccess(Duration.ofMinutes(5)).build();

    public Bucket getBucket(String IP) throws ExecutionException {
        Bucket bucket = bucketsByIPAddress.get(IP, () -> initializeBucket());
        return bucket;
    }

    private Bucket initializeBucket() {
        Refill refill = Refill.intervally(1, Duration.ofMinutes(1));
        Bandwidth bandwidth = Bandwidth.classic(1, refill);
        Bucket bucket = Bucket.builder().addLimit(bandwidth).build();
        return bucket;
    }
}
