package com.byteforge.service;

import com.byteforge.dto.SubmissionRequest;
import com.byteforge.dto.SubmissionResponse;
import com.byteforge.entity.*;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.RejectedExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Submission Service Idempotency & Backpressure Tests")
class SubmissionIdempotencyTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JudgeService judgeService;

    private SubmissionService submissionService;

    private User testUser;
    private Problem testProblem;

    @BeforeEach
    void setUp() {
        submissionService = new SubmissionService(
                submissionRepository,
                problemRepository,
                userRepository,
                judgeService
        );

        testUser = User.builder()
                .id(1L)
                .email("student@dtu.ac.in")
                .username("student_1")
                .role(Role.USER)
                .build();

        testProblem = Problem.builder()
                .id(100L)
                .title("Two Sum")
                .slug("two-sum")
                .published(true)
                .timeLimitMs(2000)
                .build();
    }

    @Test
    @DisplayName("Idempotency: Rapid duplicate submissions return existing submission without launching duplicate judge job")
    void testRapidDuplicateSubmissionDeduplication() {
        when(userRepository.findByEmail("student@dtu.ac.in")).thenReturn(Optional.of(testUser));
        when(problemRepository.findById(100L)).thenReturn(Optional.of(testProblem));

        Submission existingRecent = Submission.builder()
                .id(501L)
                .user(testUser)
                .problem(testProblem)
                .code("class Solution {}")
                .language(Language.JAVA)
                .verdict(Verdict.RUNNING)
                .submittedAt(LocalDateTime.now().minusSeconds(1)) // submitted 1 second ago
                .build();

        when(submissionRepository.findFirstByUserIdAndProblemIdOrderBySubmittedAtDesc(1L, 100L))
                .thenReturn(Optional.of(existingRecent));

        SubmissionRequest request = new SubmissionRequest(100L, "class Solution {}", Language.JAVA);

        SubmissionResponse response = submissionService.submit(request, "student@dtu.ac.in");

        assertNotNull(response);
        assertEquals(501L, response.id(), "Should return the existing recent submission ID");
        // Verify judgeService.judge was NOT called a second time
        verify(judgeService, never()).judge(anyLong());
        verify(submissionRepository, never()).save(any(Submission.class));
    }

    @Test
    @DisplayName("Backpressure: When queue is saturated, records INTERNAL_ERROR without crashing thread")
    void testBackpressureQueueSaturation() {
        when(userRepository.findByEmail("student@dtu.ac.in")).thenReturn(Optional.of(testUser));
        when(problemRepository.findById(100L)).thenReturn(Optional.of(testProblem));
        when(submissionRepository.findFirstByUserIdAndProblemIdOrderBySubmittedAtDesc(1L, 100L))
                .thenReturn(Optional.empty());

        when(submissionRepository.save(any(Submission.class))).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(502L);
            return s;
        });

        // Simulate executor queue rejection
        doThrow(new RejectedExecutionException("Queue full"))
                .when(judgeService).judge(502L);

        SubmissionRequest request = new SubmissionRequest(100L, "class Solution {}", Language.JAVA);

        SubmissionResponse response = submissionService.submit(request, "student@dtu.ac.in");

        assertNotNull(response);
        // Verify submission was updated to INTERNAL_ERROR with polite message
        verify(submissionRepository, atLeast(2)).save(argThat(s ->
                s.getVerdict() == Verdict.INTERNAL_ERROR &&
                s.getErrorMessage() != null &&
                s.getErrorMessage().contains("Judge capacity reached")
        ));
    }
}
