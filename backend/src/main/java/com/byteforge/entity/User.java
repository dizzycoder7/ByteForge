package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * The User entity implements UserDetails directly.
 *
 * Design notes (ready to explain in interviews):
 *
 * 1. Why implement UserDetails on the entity itself?
 *    Spring Security's AuthenticationProvider calls loadUserByUsername()
 *    and expects a UserDetails object back. By implementing it here we
 *    avoid a separate wrapper/adapter class and reduce indirection.
 *    Trade-off: the entity is now coupled to Spring Security â€” acceptable
 *    for a monolith, but in a microservices arch you'd use a separate DTO.
 *
 * 2. Why does getUsername() return email, not the username field?
 *    UserDetails.getUsername() is the PRINCIPAL IDENTIFIER used by the
 *    security context â€” it must be unique and stable. Emails are globally
 *    unique. The `username` field is a display handle (like @handle on
 *    CodeChef). We expose it via getHandle() to avoid a naming clash with
 *    the UserDetails contract.
 *
 * 3. Why @Getter at class level but explicit getUsername() override?
 *    Lombok detects that getUsername() is already declared and skips
 *    generating it for the `username` field. So `username` has NO auto-
 *    generated getter â€” use getHandle() instead.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Public handle / display name (e.g., "rohit_coder").
     * NOTE: No Lombok getter generated here â€” use getHandle() below.
     */
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /** Always stored as a BCrypt hash â€” NEVER the raw password. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 150)
    private String collegeName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Auto-set before the first INSERT â€” never set manually. */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // â”€â”€â”€ Display accessor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Returns the user's public handle / display name.
     * Named getHandle() to avoid collision with UserDetails.getUsername().
     */
    public String getHandle() {
        return username;
    }

    // â”€â”€â”€ UserDetails contract â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * The principal identifier used by Spring Security.
     * We use email because it is globally unique and typically verified.
     * Lombok does NOT generate getUsername() for the `username` field
     * because this explicit declaration already covers the method signature.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Returns a single authority: "ROLE_USER", "ROLE_ADMIN", etc.
     * The "ROLE_" prefix is required by Spring Security's hasRole() checks.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // Returning true for all status flags â€” we'll add account locking in a future phase.
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}

