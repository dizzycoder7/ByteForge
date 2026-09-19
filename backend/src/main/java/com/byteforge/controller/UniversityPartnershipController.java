package com.byteforge.controller;

import com.byteforge.dto.PartnershipRequest;
import com.byteforge.dto.PartnershipResponse;
import com.byteforge.entity.UniversityPartnership;
import com.byteforge.repository.UniversityPartnershipRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partnerships")
@RequiredArgsConstructor
public class UniversityPartnershipController {

    private final UniversityPartnershipRepository partnershipRepository;
    private final com.byteforge.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * POST /api/partnerships — Public endpoint.
     * Allows college coordinators, HODs, or club leads to apply for collaboration.
     */
    @PostMapping
    public ResponseEntity<PartnershipResponse> applyForPartnership(@Valid @RequestBody PartnershipRequest request) {
        UniversityPartnership entity = UniversityPartnership.builder()
                .collegeName(request.collegeName())
                .city(request.city())
                .state(request.state())
                .coordinatorName(request.coordinatorName())
                .coordinatorEmail(request.coordinatorEmail())
                .coordinatorPhone(request.coordinatorPhone())
                .designation(request.designation())
                .studentCount(request.studentCount() != null ? request.studentCount() : 100)
                .preferredTracks(request.preferredTracks())
                .message(request.message())
                .status(UniversityPartnership.PartnershipStatus.PENDING)
                .build();

        UniversityPartnership saved = partnershipRepository.save(entity);

        PartnershipResponse response = new PartnershipResponse(
                saved.getId(),
                saved.getCollegeName(),
                saved.getCity(),
                saved.getState(),
                saved.getCoordinatorName(),
                saved.getCoordinatorEmail(),
                saved.getCoordinatorPhone(),
                saved.getDesignation(),
                saved.getStudentCount(),
                saved.getPreferredTracks(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/partnerships — Public endpoint.
     * Returns list of partner institutions for landing page showcase.
     */
    @GetMapping
    public ResponseEntity<List<PartnershipResponse>> getPartnerships() {
        List<PartnershipResponse> list = partnershipRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(p -> new PartnershipResponse(
                        p.getId(),
                        p.getCollegeName(),
                        p.getCity(),
                        p.getState(),
                        p.getCoordinatorName(),
                        p.getCoordinatorEmail(),
                        p.getCoordinatorPhone(),
                        p.getDesignation(),
                        p.getStudentCount(),
                        p.getPreferredTracks(),
                        p.getStatus().name(),
                        p.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(list);
    }

    public record UpdateStatusRequest(String status) {}

    /**
     * PATCH /api/partnerships/{id}/status — Update status of application (e.g. APPROVED, REVIEWED, REJECTED).
     * If approved, automatically provisions a Faculty Administrator account!
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<PartnershipResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        UniversityPartnership p = partnershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        try {
            p.setStatus(UniversityPartnership.PartnershipStatus.valueOf(request.status().toUpperCase()));
        } catch (Exception e) {
            p.setStatus(UniversityPartnership.PartnershipStatus.APPROVED);
        }

        // Auto-provision Faculty Account upon approval if not exists
        if (p.getStatus() == UniversityPartnership.PartnershipStatus.APPROVED) {
            String email = p.getCoordinatorEmail();
            if (!userRepository.existsByEmail(email)) {
                String handle = "prof_" + email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
                if (userRepository.existsByUsername(handle)) {
                    handle = handle + "_" + System.currentTimeMillis() % 1000;
                }
                com.byteforge.entity.User faculty = com.byteforge.entity.User.builder()
                        .username(handle)
                        .email(email)
                        .password(passwordEncoder.encode("Campus@12345"))
                        .role(com.byteforge.entity.Role.FACULTY_ADMIN)
                        .collegeName(p.getCollegeName())
                        .build();
                userRepository.save(faculty);
            }
        }

        UniversityPartnership saved = partnershipRepository.save(p);

        return ResponseEntity.ok(new PartnershipResponse(
                saved.getId(),
                saved.getCollegeName(),
                saved.getCity(),
                saved.getState(),
                saved.getCoordinatorName(),
                saved.getCoordinatorEmail(),
                saved.getCoordinatorPhone(),
                saved.getDesignation(),
                saved.getStudentCount(),
                saved.getPreferredTracks(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        ));
    }
}
