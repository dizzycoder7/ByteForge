package com.byteforge.controller;

import com.byteforge.dto.AssessmentProblemDto;
import com.byteforge.dto.AssessmentSubmissionResponse;
import com.byteforge.dto.StudentAssessmentSubmitRequest;
import com.byteforge.entity.AssessmentProblem;
import com.byteforge.entity.AssessmentSubmission;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("College Assessment Security and Confidentiality Tests")
class CollegeAssessmentSecurityTest {

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

    @BeforeEach
    void setUp() {
        controller = new CollegeAssessmentController(
                assessmentRepository,
                submissionRepository,
                plagiarismService,
                problemRepository,
                assessmentJudgeService
        );
    }

    @Test
    @DisplayName("Confidentiality: Student caller NEVER receives hiddenTestCasesJson")
    void testStudentCannotSeeHiddenTestCases() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(1L)
                .assessmentId(10L)
                .title("Problem 1")
                .sampleInput("1")
                .sampleOutput("1")
                .hiddenTestCasesJson("[{\"input\":\"secret_100\",\"output\":\"secret_ans\"}]")
                .build();

        when(problemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(problem));

        // Authenticated as regular student
        Authentication studentAuth = new UsernamePasswordAuthenticationToken(
                "student_coder",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        ResponseEntity<List<AssessmentProblemDto>> response = controller.getAssessmentProblems(10L, studentAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        AssessmentProblemDto dto = response.getBody().get(0);
        assertEquals("1", dto.sampleInput());
        assertEquals("[]", dto.hiddenTestCasesJson(), "Hidden test cases must be masked for students to prevent cheating");
    }

    @Test
    @DisplayName("Faculty Access: Faculty caller receives full hiddenTestCasesJson")
    void testFacultyCanSeeHiddenTestCases() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(1L)
                .assessmentId(10L)
                .title("Problem 1")
                .sampleInput("1")
                .sampleOutput("1")
                .hiddenTestCasesJson("[{\"input\":\"secret_100\",\"output\":\"secret_ans\"}]")
                .build();

        when(problemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(problem));

        // Authenticated as faculty admin
        Authentication facultyAuth = new UsernamePasswordAuthenticationToken(
                "prof_verma",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_FACULTY_ADMIN"))
        );

        ResponseEntity<List<AssessmentProblemDto>> response = controller.getAssessmentProblems(10L, facultyAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());

        AssessmentProblemDto dto = response.getBody().get(0);
        assertTrue(dto.hiddenTestCasesJson().contains("secret_100"), "Faculty must have full visibility of test suite");
    }

    @Test
    @DisplayName("Anti-Spoofing: Client-supplied fake score and verdict are completely ignored")
    void testClientFabricatedScoreIsIgnored() {
        // Candidate claims they got 100 and ACCEPTED in the request body
        StudentAssessmentSubmitRequest maliciousReq = new StudentAssessmentSubmitRequest(
                10L,
                "Cheater Student",
                "cheater_1",
                "2023CSB9999",
                "Problem 1",
                "JAVA",
                "public class Solution {}",
                100, // Fabricated score claimed by client
                "ACCEPTED (10/10 Testcases)", // Fabricated verdict claimed by client
                0,
                "10 mins"
        );

        // Genuine judge evaluation actually determined WRONG_ANSWER with 25 marks
        SubmissionEvaluation realEvaluation = new SubmissionEvaluation(
                Verdict.WRONG_ANSWER,
                "WRONG_ANSWER (1/4 Testcases Passed)",
                25,
                100,
                4,
                1,
                45L,
                "Difference at line 1",
                List.of()
        );

        when(assessmentJudgeService.judgeAssessmentSubmission(eq(10L), anyString(), anyString(), anyString(), anyInt()))
                .thenReturn(realEvaluation);

        when(submissionRepository.save(any(AssessmentSubmission.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Authentication studentAuth = new UsernamePasswordAuthenticationToken(
                "cheater_1",
                "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        ResponseEntity<AssessmentSubmissionResponse> response = controller.submitAssessment(10L, maliciousReq, studentAuth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        // Verify that the genuinely evaluated score (25) was persisted, NOT the claimed score (100)
        assertEquals(25, response.getBody().score(), "Controller must persist verified evaluated score, not client-claimed score");
        assertTrue(response.getBody().verdict().contains("WRONG_ANSWER"), "Controller must persist verified verdict");
    }
}
