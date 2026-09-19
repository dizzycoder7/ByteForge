package com.byteforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application entry point.
 *
 * @SpringBootApplication is a composite of three annotations:
 *   - @Configuration       : marks this class as a source of bean definitions
 *   - @EnableAutoConfiguration : tells Spring Boot to auto-configure beans
 *                               based on jars on the classpath
 *   - @ComponentScan       : scans this package (and sub-packages) for
 *                            @Component, @Service, @Repository, @Controller
 */
@SpringBootApplication
public class ByteForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ByteForgeApplication.class, args);
    }
}