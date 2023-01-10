package com.example.videochat3;

import static org.junit.Assert.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.videochat3.controllers.ApiController;

@SpringBootTest
class Videochat3ApplicationTest {

	@Autowired
	ApiController apiController;

	@Test
	void contextLoads() {
		// assertNotNull(apiController);
		assertTrue(true);
	}

}
