package com.byteforge.controller;

import com.byteforge.dto.AssessmentSubmissionResponse;
import com.byteforge.dto.StudentAssessmentSubmitRequest;
import com.byteforge.entity.AssessmentSubmission;
import com.byteforge.entity.CollegeAssessment;
import com.byteforge.entity.Verdict;
import com.byteforge.judge.SubmissionEvaluation;
import com.byteforge.repository.AssessmentProblemRepository;
import com.byteforge.repository.AssessmentSubmissionRepository;
import com.byteforge.repository.CollegeAssessmentRepository;
import com.byteforge.service.AssessmentJudgeService;
import com.byteforge.service.PlagiarismService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("College Assessment Lifecycle and Attempt Enforcement Tests")
class CollegeAssessmentLifecycleTest {

    @Mock
    private CollegeAssessmentRepository assessmentRepository;

    @Mock
    private AssessmentSubmissionRepository submissionRepository;

    @Mock
    private PlagiarismService plagiarismService;

    @Mock
    private AssessmentProblemRepository problemRepository;

    @Mock
    private AssessmentJudgeService assessmentJudgeService;

    private CollegeAssessmentController controller;

    private Authentication studentAuth;
    private Authentication facultyAuth;

    @BeforeEach
    void setUp() {
        controller = new CollegeAssessmentController(
                assessmentRepository,
                submissionRepository,
                plagiarismService,
                problemRepository,
                assessmentJudgeService
        );

        studentAuth = new UsernamePasswordAuthenticationToken(
                "candidate_alice",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        facultyAuth = new UsernamePasswordAuthenticationToken(
                "prof_rao",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_FACULTY_ADMIN"))
        );
    }

    @Test
    @DisplayName("Active Assessment: Student submission is accepted and judged")
    void testActiveAssessmentSubmissionSucceeds() {
        CollegeAssessment activeAssessment = CollegeAssessment.builder()
                .id(100L)
                .assessmentName("Data Structures Practical")
                .status("ACTIVE")
                .build();

        when(assessmentRepository.findById(100L)).thenReturn(Optional.of(activeAssessment));
        when(submissionRepository.existsByAssessmentIdAndStudentHandleAndProblemTitle(100L, "candidate_alice", "Problem 1"))
                .thenReturn(false);

        SubmissionEvaluation evaluation = new SubmissionEvaluation(
                Verdict.ACCEPTED,
                "ACCEPTED (5/5 Testcases Passed)",
                100,
                100,
                5,
                5,
                24L,
                null,
                List.of()
        );

        when(assessmentJudgeService.judgeAssessmentSubmission(eq(100L), anyString(), anyString(), anyString(), anyInt()))
                .thenReturn(evaluation);

        when(submissionRepository.save(any(AssessmentSubmission.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        StudentAssessmentSubmitRequest request = new StudentAssessmentSubmitRequest(
                100L,
                "Alice Candidate",
                "candidate_alice",
                "2023CSB1001",
                "Problem 1",
                "JAVA",
                "public class Main {}",
                0,
                "",
                0,
                "25 mins"
        );

        ResponseEntity<AssessmentSubmissionResponse> response = controller.submitAssessment(100L, request, studentAuth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(100, response.getBody().score());
        assertEquals("ACCEPTED (5/5 Testcases Passed)", response.getBody().verdict());
    }

    @Test
    @DisplayName("Concluded Assessment: Student submission is rejected with 403 Forbidden")
    void testConcludedAssessmentSubmissionRejectedForStudent() {
        CollegeAssessment concludedAssessment = CollegeAssessment.builder()
                .id(101L)
                .assessmentName("Algorithms Mid-Sem Lab")
                .status("COMPLETED")
                .build();

        when(assessmentRepository.findById(101L)).thenReturn(Optional.of(concludedAssessment));

        StudentAssessmentSubmitRequest request = new StudentAssessmentSubmitRequest(
                101L,
                "Alice Candidate",
                "candidate_alice",
                "2023CSB1001",
                "Problem 1",
                "JAVA",
                "public class Main {}",
                0,
                "",
                0,
                "25 mins"
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                controller.submitAssessment(101L, request, studentAuth)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Assessment has concluded"));
        verifyNoInteractions(assessmentJudgeService);
    }

    @Test
    @DisplayName("Single Attempt Rule: Duplicate submission is rejected with 409 Conflict")
    void testDuplicateProblemSubmissionRejected() {
        CollegeAssessment activeAssessment = CollegeAssessment.builder()
                .id(102L)
                .assessmentName("Operating Systems Lab")
                .status("ACTIVE")
                .build();

        when(assessmentRepository.findById(102L)).thenReturn(Optional.of(activeAssessment));
        when(submissionRepository.existsByAssessmentIdAndStudentHandleAndProblemTitle(102L, "candidate_alice", "Problem 1"))
                .thenReturn(true); // Already submitted

        StudentAssessmentSubmitRequest request = new StudentAssessmentSubmitRequest(
                102L,
                "Alice Candidate",
                "candidate_alice",
                "2023CSB1001",
                "Problem 1",
                "JAVA",
                "public class Main {}",
                0,
                "",
                0,
                "25 mins"
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                controller.submitAssessment(102L, request, studentAuth)
        );

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("already submitted"));
        verifyNoInteractions(assessmentJudgeService);
    }

    @Test
    @DisplayName("Resume & Results: getMyAssessmentSubmissions returns candidate past attempts")
    void testGetMyAssessmentSubmissionsReturnsPastAttempts() {
        AssessmentSubmission sub = AssessmentSubmission.builder()
                .id(501L)
                .assessmentId(103L)
                .studentHandle("candidate_alice")
                .studentName("Alice Candidate")
                .problemTitle("Problem 1: Binary Search Tree")
                .score(85)
                .verdict("ACCEPTED (4/4 Testcases Passed)")
                .language("JAVA")
                .build();

        when(submissionRepository.findByAssessmentIdAndStudentHandleOrderBySubmittedAtDesc(103L, "candidate_alice"))
                .thenReturn(List.of(sub));

        ResponseEntity<List<AssessmentSubmissionResponse>> response = controller.getMyAssessmentSubmissions(
                103L,
                "candidate_alice",
                studentAuth
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(85, response.getBody().get(0).score());
        assertEquals("Problem 1: Binary Search Tree", response.getBody().get(0).problemTitle());
    }
}
