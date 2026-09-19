package com.byteforge.controller;

import com.byteforge.dto.AdminMetricsResponse;
import com.byteforge.dto.AdminUserDto;
import com.byteforge.entity.Role;
import com.byteforge.entity.Submission;
import com.byteforge.entity.UniversityPartnership;
import com.byteforge.entity.User;
import com.byteforge.entity.Verdict;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.UniversityPartnershipRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Super Admin Controller for platform analytics, user governance, and partnership approvals.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository                userRepository;
    private final ProblemRepository             problemRepository;
    private final SubmissionRepository          submissionRepository;
    private final UniversityPartnershipRepository partnershipRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MMM dd, HH:mm");

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getMetrics() {
        long totalUsers       = userRepository.count();
        long totalProblems    = problemRepository.count();
        long totalSubmissions = submissionRepository.count();

        long pendingPartnerships = partnershipRepository.findAll().stream()
                .filter(p -> p.getStatus() == UniversityPartnership.PartnershipStatus.PENDING)
                .count();

        List<Submission> recent = submissionRepository.findAll(
                PageRequest.of(0, 10, Sort.by("submittedAt").descending())
        ).getContent();

        long acceptedCount = recent.stream()
                .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                .count();

        List<AdminMetricsResponse.RecentAdminSubmission> recentList = recent.stream()
                .map(s -> new AdminMetricsResponse.RecentAdminSubmission(
                        s.getId(),
                        s.getUser().getHandle(),
                        s.getProblem().getTitle(),
                        s.getLanguage().name(),
                        s.getVerdict() != null ? s.getVerdict().name() : "PENDING",
                        s.getExecutionTimeMs(),
                        s.getSubmittedAt() != null ? s.getSubmittedAt().format(FORMATTER) : "Just now"
                ))
                .toList();

        return ResponseEntity.ok(new AdminMetricsResponse(
                totalUsers,
                totalProblems,
                totalSubmissions,
                pendingPartnerships,
                acceptedCount,
                recentList
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<AdminUserDto> users = userRepository.findAll(Sort.by("createdAt").descending())
                .stream()
                .map(u -> new AdminUserDto(
                        u.getId(),
                        u.getHandle(),
                        u.getUsername(), // email in UserDetails contract
                        u.getRole().name(),
                        u.getCollegeName() != null ? u.getCollegeName() : "Independent Coder",
                        u.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }

    public record UpdateRoleRequest(String role) {}

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        try {
            user.setRole(Role.valueOf(request.role().toUpperCase()));
        } catch (Exception e) {
            user.setRole(Role.USER);
        }

        User saved = userRepository.save(user);

        return ResponseEntity.ok(new AdminUserDto(
                saved.getId(),
                saved.getHandle(),
                saved.getUsername(),
                saved.getRole().name(),
                saved.getCollegeName(),
                saved.getCreatedAt()
        ));
    }

    @PostMapping("/sync-credentials")
    public ResponseEntity<String> syncCredentials(
            @org.springframework.beans.factory.annotation.Autowired org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        // Sync rohit_coder
        userRepository.findByUsername("rohit_coder").ifPresent(u -> {
            u.setEmail("rohit@dtu.ac.in");
            u.setPassword(passwordEncoder.encode("Student@12345"));
            u.setCollegeName("Delhi Technological University (DTU)");
            u.setRole(Role.USER);
            userRepository.save(u);
        });

        // Sync admin
        userRepository.findByUsername("admin").ifPresent(u -> {
            u.setEmail("admin@byteforge.tech");
            u.setPassword(passwordEncoder.encode("Admin@12345"));
            u.setRole(Role.ADMIN);
            userRepository.save(u);
        });

        // Sync prof_verma
        userRepository.findByUsername("prof_verma").ifPresent(u -> {
            u.setEmail("faculty@dtu.ac.in");
            u.setPassword(passwordEncoder.encode("Campus@12345"));
            u.setRole(Role.FACULTY_ADMIN);
            u.setCollegeName("Delhi Technological University (DTU)");
            userRepository.save(u);
        });

        // Sync priya_sharma
        userRepository.findByUsername("priya_sharma").ifPresent(u -> {
            u.setEmail("priya@iitd.ac.in");
            u.setPassword(passwordEncoder.encode("Student@12345"));
            u.setRole(Role.USER);
            u.setCollegeName("IIT Delhi");
            userRepository.save(u);
        });

        return ResponseEntity.ok("Credentials synchronized successfully!");
    }
}
