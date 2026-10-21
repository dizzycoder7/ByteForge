package com.byteforge.entity;

/**
 * All possible outcomes and states for a submission in ByteForge.
 *
 * PENDING            → Saved in database, queued waiting for judge thread
 * RUNNING            → Worker thread picked up the submission and is compiling/executing
 * COMPILATION_ERROR  → Candidate code failed to compile (javac / g++ returned non-zero)
 * RUNTIME_ERROR      → Candidate code crashed during execution (non-zero exit code, unhandled exception)
 * TIME_LIMIT_EXCEEDED→ Candidate process did not finish within problem.timeLimitMs
 * MEMORY_LIMIT_EXCEEDED → Candidate process exceeded memory cap
 * WRONG_ANSWER       → Program finished in time, but output did not match expected output
 * ACCEPTED           → Every required test case executed and passed under checker rules
 * INTERNAL_ERROR     → Infrastructure failure (missing runtime/compiler, missing test cases, I/O error)
 */
public enum Verdict {
    PENDING,
    RUNNING,
    COMPILATION_ERROR,
    RUNTIME_ERROR,
    TIME_LIMIT_EXCEEDED,
    MEMORY_LIMIT_EXCEEDED,
    WRONG_ANSWER,
    ACCEPTED,
    INTERNAL_ERROR
}

