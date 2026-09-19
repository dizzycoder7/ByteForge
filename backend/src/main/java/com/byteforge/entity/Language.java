package com.byteforge.entity;

/**
 * Programming languages supported by the ByteForge judge.
 *
 * Stored as STRING in submissions table.
 * Adding a new language here requires corresponding execution logic in JudgeService.
 *
 * Phase 3 supports: Java 21, C++ (g++), Python 3
 * Phase 4 (sandboxing): will wrap these in Docker containers.
 */
public enum Language {
    JAVA,
    CPP,
    PYTHON
}
