package com.byteforge.service;

import com.byteforge.entity.AssessmentProblem;
import com.byteforge.entity.CollegeAssessment;
import com.byteforge.entity.Verdict;
import com.byteforge.judge.OutputChecker;
import com.byteforge.judge.SubmissionEvaluation;
import com.byteforge.judge.TestCasePair;
import com.byteforge.repository.AssessmentProblemRepository;
import com.byteforge.repository.CollegeAssessmentRepository;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.TestCaseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AssessmentJudgeService Scoring and Evaluation Tests")
class AssessmentJudgeServiceTest {

    @Mock
    private AssessmentProblemRepository assessmentProblemRepository;

    @Mock
    private CollegeAssessmentRepository collegeAssessmentRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private TestCaseRepository testCaseRepository;

    private ObjectMapper objectMapper;
    private OutputChecker outputChecker;
    private JudgeService judgeService;
    private AssessmentJudgeService assessmentJudgeService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        outputChecker = new OutputChecker();
        judgeService = new JudgeService(submissionRepository, testCaseRepository, outputChecker);
        assessmentJudgeService = new AssessmentJudgeService(
                judgeService,
                assessmentProblemRepository,
                collegeAssessmentRepository,
                objectMapper
        );
    }

    @Test
    @DisplayName("Assessment Partial Scoring: 2 of 3 test cases pass = 33 of 50 marks")
    void testAssessmentPartialScoring() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(1L)
                .assessmentId(10L)
                .title("Problem 1: Add Numbers")
                .points(50)
                .sampleInput("2 3")
                .sampleOutput("5")
                .hiddenTestCasesJson("[{\"input\":\"10 20\",\"output\":\"30\"},{\"input\":\"1 1\",\"output\":\"100\"}]")
                .build();

        when(assessmentProblemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(problem));

        CollegeAssessment assessment = CollegeAssessment.builder()
                .id(10L)
                .browserRestrictions(false)
                .build();

        when(collegeAssessmentRepository.findById(10L))
                .thenReturn(Optional.of(assessment));

        String studentCode = """
                import java.util.Scanner;
                public class Solution {
                    public static void main(String[] args) {
                        Scanner sc = new Scanner(System.in);
                        if (sc.hasNextInt()) {
                            int a = sc.nextInt();
                            int b = sc.nextInt();
                            System.out.println(a + b);
                        }
                    }
                }
                """;

        SubmissionEvaluation eval = assessmentJudgeService.judgeAssessmentSubmission(
                10L, "Problem 1: Add Numbers", studentCode, "JAVA", 0
        );

        // Test 1 (2+3=5): Pass
        // Test 2 (10+20=30): Pass
        // Test 3 (1+1=2 != 100): Fail
        assertEquals(3, eval.totalTestCases());
        assertEquals(2, eval.passedTestCases());
        assertEquals(Verdict.WRONG_ANSWER, eval.verdict());
        assertEquals(33, eval.score(), "2/3 of 50 points = 33 points (rounded)");
        assertTrue(eval.detailedVerdict().contains("2/3 Testcases Passed"));
    }

    @Test
    @DisplayName("Assessment Full Marks: All test cases pass = 50 of 50 marks, ACCEPTED")
    void testAssessmentFullMarks() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(2L)
                .assessmentId(10L)
                .title("Problem 2: Multiply Numbers")
                .points(50)
                .sampleInput("3 4")
                .sampleOutput("12")
                .hiddenTestCasesJson("[{\"input\":\"5 6\",\"output\":\"30\"}]")
                .build();

        when(assessmentProblemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(problem));

        CollegeAssessment assessment = CollegeAssessment.builder()
                .id(10L)
                .browserRestrictions(false)
                .build();

        when(collegeAssessmentRepository.findById(10L))
                .thenReturn(Optional.of(assessment));

        String studentCode = """
                import java.util.Scanner;
                public class Solution {
                    public static void main(String[] args) {
                        Scanner sc = new Scanner(System.in);
                        if (sc.hasNextInt()) {
                            int a = sc.nextInt();
                            int b = sc.nextInt();
                            System.out.println(a * b);
                        }
                    }
                }
                """;

        SubmissionEvaluation eval = assessmentJudgeService.judgeAssessmentSubmission(
                10L, "Problem 2: Multiply Numbers", studentCode, "JAVA", 0
        );

        assertEquals(2, eval.totalTestCases());
        assertEquals(2, eval.passedTestCases());
        assertEquals(Verdict.ACCEPTED, eval.verdict());
        assertEquals(50, eval.score());
        assertTrue(eval.isAccepted());
    }

    @Test
    @DisplayName("Proctoring Integrity Penalty: Deducts tab-switch penalties from earned score")
    void testProctoringPenalty() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(3L)
                .assessmentId(10L)
                .title("Problem 3: Simple Echo")
                .points(100)
                .sampleInput("hello")
                .sampleOutput("hello")
                .build();

        when(assessmentProblemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(problem));

        CollegeAssessment assessment = CollegeAssessment.builder()
                .id(10L)
                .browserRestrictions(true) // Browser restrictions enabled
                .build();

        when(collegeAssessmentRepository.findById(10L))
                .thenReturn(Optional.of(assessment));

        String studentCode = """
                import java.util.Scanner;
                public class Solution {
                    public static void main(String[] args) {
                        Scanner sc = new Scanner(System.in);
                        if (sc.hasNext()) System.out.println(sc.next());
                    }
                }
                """;

        // Student had 2 tab switches during proctored exam (2 * 5% = 10% penalty)
        SubmissionEvaluation eval = assessmentJudgeService.judgeAssessmentSubmission(
                10L, "Problem 3: Simple Echo", studentCode, "JAVA", 2
        );

        assertEquals(Verdict.ACCEPTED, eval.verdict());
        assertEquals(90, eval.score(), "100 base score - 10% penalty = 90 score");
    }

    @Test
    @DisplayName("No Test Cases: Problem without test cases returns INTERNAL_ERROR, never AC")
    void testNoTestCasesConfigured() {
        AssessmentProblem emptyProblem = AssessmentProblem.builder()
                .id(4L)
                .assessmentId(10L)
                .title("Problem 4: Unconfigured")
                .points(50)
                .sampleInput("")
                .sampleOutput("")
                .hiddenTestCasesJson("[]")
                .build();

        when(assessmentProblemRepository.findByAssessmentIdOrderByOrderIndexAsc(10L))
                .thenReturn(List.of(emptyProblem));

        SubmissionEvaluation eval = assessmentJudgeService.judgeAssessmentSubmission(
                10L, "Problem 4: Unconfigured", "public class Solution {}", "JAVA", 0
        );

        assertEquals(Verdict.INTERNAL_ERROR, eval.verdict());
        assertEquals(0, eval.score());
        assertFalse(eval.isAccepted());
    }

    @Test
    @DisplayName("Hidden Test Case JSON Parsing: Supports both 'output' and 'expectedOutput' keys")
    void testHiddenTestCaseJsonParsing() {
        AssessmentProblem problem = AssessmentProblem.builder()
                .id(5L)
                .sampleInput("1")
                .sampleOutput("1")
                .hiddenTestCasesJson("[{\"input\":\"2\",\"output\":\"2\"},{\"inputData\":\"3\",\"expectedOutput\":\"3\"}]")
                .build();

        List<TestCasePair> pairs = assessmentJudgeService.extractTestCases(problem);
        assertEquals(3, pairs.size());
        assertEquals("1", pairs.get(0).inputData());
        assertEquals("2", pairs.get(1).inputData());
        assertEquals("3", pairs.get(2).inputData());
        assertEquals("3", pairs.get(2).expectedOutput());
    }
}
