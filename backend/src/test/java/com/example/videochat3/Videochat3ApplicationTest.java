package com.example.videochat3;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.net.URI;
import java.net.URISyntaxException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;

import com.example.videochat3.DTO.RequestDemoDTO;
import com.example.videochat3.controllers.ApiController;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class Videochat3ApplicationTest {

	@Value(value="${local.server.port}")
	private int port;

	@Autowired
	TestRestTemplate testRestTemplate;

	@Autowired
	ApiController apiController;


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

	@Test
	public void requestDemoShouldReturn400StatusWhenNameIsMissing() throws URISyntaxException {
		RequestDemoDTO requestBody = new RequestDemoDTO(null, "user@example.com", "It's cool!", "recaptchaToken");
		RequestEntity<RequestDemoDTO> requestEntity = RequestEntity.post(new URI(createUrl("/api/request_demo"))).contentType(MediaType.APPLICATION_JSON).body(requestBody);	
		ResponseEntity<Object> responseEntity = testRestTemplate.exchange(createUrl("/api/request_demo"), HttpMethod.POST, requestEntity, Object.class);
		assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
	}

	@Test
	public void requestDemoShouldReturn400StatusWhenEmailIsMissing() throws URISyntaxException {
		RequestDemoDTO requestBody = new RequestDemoDTO("name", null, "It's cool!", "recaptchaToken");
		RequestEntity<RequestDemoDTO> requestEntity = RequestEntity.post(new URI(createUrl("/api/request_demo"))).contentType(MediaType.APPLICATION_JSON).body(requestBody);	
		ResponseEntity<Object> responseEntity = testRestTemplate.exchange(createUrl("/api/request_demo"), HttpMethod.POST, requestEntity, Object.class);
		assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
	}

	@Test
	public void requestDemoShouldReturn400StatusWhenReasonForInterestIsMissing() throws URISyntaxException {
		RequestDemoDTO requestBody = new RequestDemoDTO("name", "user@example.com", null, "recaptchaToken");
		RequestEntity<RequestDemoDTO> requestEntity = RequestEntity.post(new URI(createUrl("/api/request_demo"))).contentType(MediaType.APPLICATION_JSON).body(requestBody);	
		ResponseEntity<Object> responseEntity = testRestTemplate.exchange(createUrl("/api/request_demo"), HttpMethod.POST, requestEntity, Object.class);
		assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
	}

	@Test
	public void requestDemoShouldReturn400StatusWhenRecaptchaTokenIsMissing() throws URISyntaxException {
		RequestDemoDTO requestBody = new RequestDemoDTO("name", "user@example.com", "It's cool!", null);
		RequestEntity<RequestDemoDTO> requestEntity = RequestEntity.post(new URI(createUrl("/api/request_demo"))).contentType(MediaType.APPLICATION_JSON).body(requestBody);	
		ResponseEntity<Object> responseEntity = testRestTemplate.exchange(createUrl("/api/request_demo"), HttpMethod.POST, requestEntity, Object.class);
		assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
	}

	@Test
	public void requestDemoShouldReturn403WhenRecaptchaManagerFailsToVerifyToken() throws URISyntaxException {
		RequestDemoDTO requestBody = new RequestDemoDTO("rob", "bot@example.com", "I'm a robot!", "invalidRecaptchaToken");
		RequestEntity<RequestDemoDTO> requestEntity = RequestEntity.post(new URI(createUrl("/api/request_demo"))).contentType(MediaType.APPLICATION_JSON).body(requestBody);	
		ResponseEntity<Object> responseEntity = testRestTemplate.exchange(createUrl("/api/request_demo"), HttpMethod.POST, requestEntity, Object.class);
		assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
	}
}
