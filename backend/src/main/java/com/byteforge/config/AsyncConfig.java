package com.byteforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Configures the thread pool used by @Async judge tasks.
 *
 * Why a dedicated thread pool instead of Spring's default SimpleAsyncTaskExecutor?
 *   SimpleAsyncTaskExecutor creates a new thread per task — unbounded. Under high
 *   submission load this would spawn thousands of threads, exhausting memory.
 *   A bounded ThreadPoolTaskExecutor lets us control concurrency explicitly.
 *
 * Pool parameters:
 *   corePoolSize  = 2  → always-alive threads for judging
 *   maxPoolSize   = 5  → burst capacity (up to 5 concurrent judgements)
 *   queueCapacity = 50 → submissions wait here if all 5 threads are busy
 *
 * RejectedExecutionHandler = CallerRunsPolicy:
 *   If the queue is full AND all threads are busy, the submission thread itself
 *   runs the judging task synchronously. This provides natural backpressure —
 *   the API slows down instead of rejecting requests outright.
 *
 * Interview insight: This is a classic producer-consumer problem.
 *   Submissions = producers, judge threads = consumers, queue = buffer.
 *   In production (Codeforces/LeetCode scale), this queue becomes a full
 *   message broker like Kafka or RabbitMQ.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "judgeExecutor")
    public Executor judgeExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ByteForge-Judge-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
