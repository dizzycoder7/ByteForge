package com.byteforge.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Thread pool configuration for asynchronous online judging.
 *
 * Configured with bounded concurrency and explicit backpressure to prevent
 * Tomcat HTTP request thread exhaustion under high assessment traffic.
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "judgeExecutor")
    public Executor judgeExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("ByteForge-Judge-");

        // Custom RejectedExecutionHandler: Logs saturation and prevents Tomcat thread starvation.
        // Instead of CallerRunsPolicy (which forces HTTP threads to compile/run untrusted code),
        // we reject with backpressure diagnostics.
        executor.setRejectedExecutionHandler(new RejectedExecutionHandler() {
            @Override
            public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
                log.error("[JudgeExecutor] Queue saturated! Active: {}, QueueSize: {}. Applying backpressure.",
                        e.getActiveCount(), e.getQueue().size());
                throw new java.util.concurrent.RejectedExecutionException(
                        "ByteForge judge queue is currently at maximum capacity. Please retry shortly.");
            }
        });

        executor.initialize();
        return executor;
    }
}
