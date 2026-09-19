package com.byteforge.service;

import com.byteforge.dto.TestCaseRequest;
import com.byteforge.dto.TestCaseResponse;
import com.byteforge.entity.Problem;
import com.byteforge.entity.TestCase;
import com.byteforge.exception.ResourceNotFoundException;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository  problemRepository;

    /** Add a test case to a problem. Admin only (enforced at controller). */
    public TestCaseResponse create(Long problemId, TestCaseRequest request) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Problem not found with id: " + problemId));

        TestCase tc = TestCase.builder()
                .problem(problem)
                .inputData(request.inputData())
                .expectedOutput(request.expectedOutput())
                .sample(request.sample())
                .orderIndex(request.orderIndex())
                .build();

        return toResponse(testCaseRepository.save(tc));
    }

    /** All test cases for a problem (admin view — includes hidden). */
    @Transactional(readOnly = true)
    public List<TestCaseResponse> getAllByProblem(Long problemId) {
        if (!problemRepository.existsById(problemId)) {
            throw new ResourceNotFoundException("Problem not found with id: " + problemId);
        }
        return testCaseRepository.findByProblemIdOrderByOrderIndexAsc(problemId)
                .stream().map(this::toResponse).toList();
    }

    /**
     * Sample test cases only — publicly visible on the problem page.
     * Hidden test cases (sample = false) are never exposed here.
     */
    @Transactional(readOnly = true)
    public List<TestCaseResponse> getSamplesByProblem(Long problemId) {
        if (!problemRepository.existsById(problemId)) {
            throw new ResourceNotFoundException("Problem not found with id: " + problemId);
        }
        return testCaseRepository.findByProblemIdAndSampleTrueOrderByOrderIndexAsc(problemId)
                .stream().map(this::toResponse).toList();
    }

    /** Delete a single test case by ID. Admin only. */
    public void delete(Long problemId, Long testCaseId) {
        TestCase tc = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Test case not found with id: " + testCaseId));

        // Verify the test case actually belongs to this problem
        if (!tc.getProblem().getId().equals(problemId)) {
            throw new ResourceNotFoundException(
                    "Test case " + testCaseId + " does not belong to problem " + problemId);
        }
        testCaseRepository.delete(tc);
    }

    private TestCaseResponse toResponse(TestCase tc) {
        return new TestCaseResponse(
                tc.getId(),
                tc.getProblem().getId(),
                tc.getInputData(),
                tc.getExpectedOutput(),
                tc.isSample(),
                tc.getOrderIndex(),
                tc.getCreatedAt()
        );
    }
}
