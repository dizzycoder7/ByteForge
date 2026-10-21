package com.byteforge.judge;

/**
 * Output comparison policies supported by the ByteForge online judge.
 *
 * EXACT:
 *   Character-by-character exact match (normalizes CRLF to LF, but preserves all whitespace).
 *
 * NORMALIZED_WHITESPACE (Default competitive programming policy):
 *   Trims trailing whitespace per line, trims trailing empty lines, normalizes CRLF to LF.
 *   Does NOT delete internal blank lines or change lowercase/uppercase characters.
 *
 * TOKEN_BASED:
 *   Splits by whitespace into tokens. Floating-point numbers are compared with 1e-6 epsilon.
 */
public enum ComparisonPolicy {
    EXACT,
    NORMALIZED_WHITESPACE,
    TOKEN_BASED
}
