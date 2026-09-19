package com.byteforge.entity;

/**
 * Application roles stored as a STRING column in the users table.
 *
 * Stored as VARCHAR via @Enumerated(EnumType.STRING) in User.java.
 * Using STRING (not ORDINAL) so that reordering this enum never
 * corrupts existing DB rows â€” a common production footgun with ORDINAL.
 */
public enum Role {
    USER,           // default for all new registrations
    FACULTY_ADMIN,  // institutional faculty mentor — access to University Dashboard only
    PROBLEM_SETTER, // can create and manage problems
    ADMIN           // Super Admin — full platform access
}

