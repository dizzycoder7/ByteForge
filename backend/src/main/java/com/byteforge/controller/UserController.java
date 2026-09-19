package com.byteforge.controller;

import com.byteforge.dto.ProfileStats;
import com.byteforge.entity.Difficulty;
import com.byteforge.entity.User;
import com.byteforge.exception.ResourceNotFoundException;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/users/{username} — Public endpoint, no authentication required.
 *
 * Returns the public profile + stats for any user by their display handle.
 * Email and password are never exposed (ProfileStats DTO excludes them).
 *
 * The stats are computed with 4 separate JPQL queries — this is intentional:
 *   - Each query is simple, testable, and cacheable independently
 *   - A single complex query would be harder to understand and maintain
 *   - For high-traffic scenarios (Phase 6+), add @Cacheable here
 *
 * Interview note on the N-query pattern:
 *   4 queries for a single profile load is NOT N+1. N+1 is when you execute
 *   N queries inside a loop (e.g., for each of 100 problems, fetch its author).
 *   Here, we run 4 fixed queries regardless of data size — this is fine.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository       userRepository;
    private final SubmissionRepository submissionRepository;

    @GetMapping("/{username}")
    public ResponseEntity<ProfileStats> getProfile(@PathVariable String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: @" + username));

        long totalSubmissions = submissionRepository.countTotalByHandle(username);
        long problemsSolved   = submissionRepository.countProblemsSolvedByHandle(username);
        long easyCount        = submissionRepository.countProblemsSolvedByDifficulty(username, Difficulty.EASY);
        long mediumCount      = submissionRepository.countProblemsSolvedByDifficulty(username, Difficulty.MEDIUM);
        long hardCount        = submissionRepository.countProblemsSolvedByDifficulty(username, Difficulty.HARD);

        // CodeChef-style dynamic rating and stars calculation
        int ratingScore = (int) Math.min(2800, 1200 + (problemsSolved * 4));
        int starRating  = ratingScore < 1400 ? 1
                        : ratingScore < 1600 ? 2
                        : ratingScore < 1800 ? 3
                        : ratingScore < 2000 ? 4
                        : ratingScore < 2200 ? 5
                        : ratingScore < 2500 ? 6 : 7;

        String collegeName = (user.getCollegeName() != null && !user.getCollegeName().isBlank())
                ? user.getCollegeName()
                : "Delhi Technological University (DTU)";

        ProfileStats stats = new ProfileStats(
                user.getHandle(),
                user.getRole().name(),
                collegeName,
                starRating,
                ratingScore,
                totalSubmissions,
                problemsSolved,
                easyCount,
                mediumCount,
                hardCount,
                user.getCreatedAt()
        );

        return ResponseEntity.ok(stats);
    }

    public record UpdateCollegeRequest(String collegeName) {}

    @PutMapping("/profile/college")
    public ResponseEntity<Void> updateCollege(
            @RequestBody UpdateCollegeRequest request,
            java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setCollegeName(request.collegeName());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
