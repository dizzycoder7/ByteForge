package com.byteforge.service;

import com.byteforge.entity.Language;
import com.byteforge.entity.Verdict;
import com.byteforge.judge.ComparisonPolicy;
import com.byteforge.judge.OutputChecker;
import com.byteforge.judge.SubmissionEvaluation;
import com.byteforge.judge.TestCasePair;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.TestCaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JudgeService Engine Execution Tests")
class JudgeServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private TestCaseRepository testCaseRepository;

    private OutputChecker outputChecker;
    private JudgeService judgeService;

    @BeforeEach
    void setUp() {
        outputChecker = new OutputChecker();
        judgeService = new JudgeService(submissionRepository, testCaseRepository, outputChecker);
    }

    @Test
    @DisplayName("Correct Solution: Receives ACCEPTED with full marks")
    void testAcceptedSolution() {
        String code = """
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

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "2 3", "5", true),
                new TestCasePair(2, "10 20", "30", false),
                new TestCasePair(3, "-5 5", "0", false)
        );

        SubmissionEvaluation eval = judgeService.evaluateCode(
                code, Language.JAVA, testCases, 3000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.ACCEPTED, eval.verdict());
        assertEquals(3, eval.passedTestCases());
        assertEquals(3, eval.totalTestCases());
        assertEquals(100, eval.score());
        assertTrue(eval.isAccepted());
    }

    @Test
    @DisplayName("Incorrect Solution: Receives WRONG_ANSWER and calculates partial score")
    void testWrongAnswerSolution() {
        String code = """
                import java.util.Scanner;
                public class Solution {
                    public static void main(String[] args) {
                        Scanner sc = new Scanner(System.in);
                        if (sc.hasNextInt()) {
                            int a = sc.nextInt();
                            int b = sc.nextInt();
                            // Bug: multiplies instead of adding
                            System.out.println(a * b);
                        }
                    }
                }
                """;

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "2 2", "4", true), // 2*2 == 2+2 (passes coincidentally)
                new TestCasePair(2, "3 5", "8", false), // 3*5 = 15 != 8 (fails)
                new TestCasePair(3, "1 0", "1", false)  // 1*0 = 0 != 1 (fails)
        );

        SubmissionEvaluation eval = judgeService.evaluateCode(
                code, Language.JAVA, testCases, 3000, 60, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.WRONG_ANSWER, eval.verdict());
        assertEquals(1, eval.passedTestCases());
        assertEquals(3, eval.totalTestCases());
        assertEquals(20, eval.score(), "1/3 of 60 points = 20 points");
        assertFalse(eval.isAccepted());
    }

    @Test
    @DisplayName("Invalid Syntax: Receives COMPILATION_ERROR with sanitized error diagnostic")
    void testCompilationError() {
        String brokenCode = """
                public class Solution {
                    public static void main(String[] args) {
                        System.out.println("Missing semicolon")
                    }
                }
                """;

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "1", "1", true)
        );

        SubmissionEvaluation eval = judgeService.evaluateCode(
                brokenCode, Language.JAVA, testCases, 3000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.COMPILATION_ERROR, eval.verdict());
        assertEquals(0, eval.passedTestCases());
        assertEquals(0, eval.score());
        assertNotNull(eval.errorMessage());
        assertTrue(eval.errorMessage().contains("error:") || eval.errorMessage().contains("';' expected"),
                "Compiler diagnostic should report syntax error without revealing server paths");
        assertFalse(eval.errorMessage().contains("C:\\Users\\"), "File system paths must be sanitized");
    }

    @Test
    @DisplayName("Runtime Crash: Receives RUNTIME_ERROR")
    void testRuntimeCrash() {
        String crashingCode = """
                public class Solution {
                    public static void main(String[] args) {
                        int x = 10 / 0; // ArithmeticException
                    }
                }
                """;

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "input", "output", true)
        );

        SubmissionEvaluation eval = judgeService.evaluateCode(
                crashingCode, Language.JAVA, testCases, 3000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.RUNTIME_ERROR, eval.verdict());
        assertEquals(0, eval.passedTestCases());
        assertEquals(0, eval.score());
        assertNotNull(eval.errorMessage());
        assertTrue(eval.errorMessage().contains("ArithmeticException") || eval.errorMessage().contains("divide by zero"));
    }

    @Test
    @DisplayName("Infinite Loop: Receives TIME_LIMIT_EXCEEDED and kills process tree")
    void testTimeLimitExceeded() {
        String infiniteLoopCode = """
                public class Solution {
                    public static void main(String[] args) {
                        long count = 0;
                        while (true) {
                            count++;
                        }
                    }
                }
                """;

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "5", "5", true)
        );

        long start = System.currentTimeMillis();
        SubmissionEvaluation eval = judgeService.evaluateCode(
                infiniteLoopCode, Language.JAVA, testCases, 1200, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );
        long elapsed = System.currentTimeMillis() - start;

        assertEquals(Verdict.TIME_LIMIT_EXCEEDED, eval.verdict());
        assertEquals(0, eval.passedTestCases());
        assertTrue(elapsed >= 1100 && elapsed < 4000, "Process should be forcibly killed within timeout tolerance");
    }

    @Test
    @DisplayName("Missing Test Data: Returns INTERNAL_ERROR and 0 score, NEVER false ACCEPTED")
    void testMissingTestCasesYieldsInternalError() {
        String validCode = """
                public class Solution {
                    public static void main(String[] args) {
                        System.out.println("Hello");
                    }
                }
                """;

        SubmissionEvaluation eval = judgeService.evaluateCode(
                validCode, Language.JAVA, List.of(), 2000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.INTERNAL_ERROR, eval.verdict());
        assertEquals(0, eval.score());
        assertEquals(0, eval.passedTestCases());
        assertFalse(eval.isAccepted(), "A problem with 0 test cases must NEVER receive Accepted");
    }

    @Test
    @DisplayName("Oversized Output: Truncates output without exhausting JVM heap")
    void testOversizedOutputProtection() {
        String spamCode = """
                public class Solution {
                    public static void main(String[] args) {
                        for (int i = 0; i < 50000; i++) {
                            System.out.println("Flood the stdout buffer with repetitive text lines to simulate log bomb 123456789");
                        }
                    }
                }
                """;

        List<TestCasePair> testCases = List.of(
                new TestCasePair(1, "", "Expected small output", true)
        );

        SubmissionEvaluation eval = judgeService.evaluateCode(
                spamCode, Language.JAVA, testCases, 3000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.WRONG_ANSWER, eval.verdict());
        assertFalse(eval.isAccepted());
    }

    @Test
    @DisplayName("Compiler binary missing on host: Classified as INTERNAL_ERROR, not false candidate CE")
    void testMissingCompilerReportsInternalError() {
        // g++ is not installed on the Windows host
        String cppCode = "#include <iostream>\nint main() { return 0; }";

        SubmissionEvaluation eval = judgeService.evaluateCode(
                cppCode, Language.CPP, List.of(new TestCasePair(1, "", "", true)),
                2000, 100, ComparisonPolicy.NORMALIZED_WHITESPACE, false
        );

        assertEquals(Verdict.INTERNAL_ERROR, eval.verdict());
        assertTrue(eval.errorMessage().contains("Infrastructure Warning") || eval.errorMessage().contains("Compiler binary"),
                "Must clearly attribute failure to infrastructure missing compiler");
    }
}
