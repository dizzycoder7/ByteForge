package com.byteforge.entity;

/**
 * Difficulty level for a problem.
 *
 * Stored as STRING in the DB (EnumType.STRING in Problem.java).
 * Three levels match CodeChef / LeetCode conventions.
 * Kept as an enum (not a table) because difficulty is a fixed domain value
 * that never needs metadata â€” it's not a "thing," it's an attribute.
 */
public enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}

