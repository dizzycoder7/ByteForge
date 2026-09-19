package com.byteforge.entity;

/**
 * All possible outcomes for a submission, in roughly the order a judge checks them.
 *
 * PENDING            → saved, waiting for the judge thread to pick it up
 * COMPILATION_ERROR  → code failed to compile (javac / g++ returned non-zero)
 * RUNTIME_ERROR      → compiled OK but crashed during execution (non-zero exit code)
 * TIME_LIMIT_EXCEEDED→ process did not finish within problem.timeLimitMs
 * MEMORY_LIMIT_EXCEEDED → process exceeded memory cap (Phase 4 — requires OS-level tracking)
 * WRONG_ANSWER       → compiled, ran, finished in time — but output didn't match expected
 * ACCEPTED           → all test cases passed
 *
 * Interview note: verdicts are checked in this priority order by real judges too.
 * CE is shown before WA/TLE because you can't run code that doesn't compile.
 */
public enum Verdict {
    PENDING,
    COMPILATION_ERROR,
    RUNTIME_ERROR,
    TIME_LIMIT_EXCEEDED,
    MEMORY_LIMIT_EXCEEDED,
    WRONG_ANSWER,
    ACCEPTED
}
