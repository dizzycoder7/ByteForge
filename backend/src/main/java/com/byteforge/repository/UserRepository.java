package com.byteforge.repository;

import com.byteforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 *
 * Spring auto-generates the SQL at runtime based on method names â€”
 * no implementation class needed. This is the Repository pattern.
 *
 * Interview point: Spring Data parses "findByEmail" as:
 *   SELECT * FROM users WHERE email = ?
 * Similarly "existsByEmail" becomes:
 *   SELECT COUNT(*) > 0 FROM users WHERE email = ?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Used by AuthService.login() and UserDetailsService to load a user. */
    Optional<User> findByEmail(String email);

    /** Used during registration to check for duplicate emails before saving. */
    boolean existsByEmail(String email);

    /** Used during registration to check for duplicate handles before saving. */
    boolean existsByUsername(String username);

    /** Used by UserController to look up a public profile by display handle. */
    Optional<User> findByUsername(String username);
}

