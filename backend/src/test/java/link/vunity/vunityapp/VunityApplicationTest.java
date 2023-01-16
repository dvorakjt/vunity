package link.vunity.vunityapp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.net.URI;
import java.net.URISyntaxException;
import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;

import link.vunity.vunityapp.controllers.ApiController;
import link.vunity.vunityapp.ratelimit.RateLimitingInterceptor;
import link.vunity.vunityapp.service.EmailService;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class VunityApplicationTest {

	@Value(value="${local.server.port}")
	private int port;

	@Autowired
	TestRestTemplate testRestTemplate;

	@Autowired
	ApiController apiController;

	@MockBean
	EmailService emailService;

	@Before
    public void initMocks() {
        MockitoAnnotations.openMocks(this);
    }

	@Test
	public void contextLoads() {
		assertNotNull(apiController);
	}

	private String createUrl(String endpoint) {
		return "http://localhost:" + this.port + endpoint;
	}

	@Test
	public void getCSRFTokenShouldReturn200Status() throws URISyntaxException {
		RequestEntity<Object> requestEntity = new RequestEntity<>(HttpMethod.GET, new URI(createUrl("/api/csrf_token")));
		ResponseEntity<Object> entity = testRestTemplate.exchange(createUrl("/api/csrf_token"), HttpMethod.GET, requestEntity, Object.class);
		assertEquals(HttpStatus.OK, entity.getStatusCode());
	}
}
