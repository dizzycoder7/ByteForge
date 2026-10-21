package com.byteforge.controller;

import com.byteforge.dto.AssessmentResponse;
import com.byteforge.dto.CreateAssessmentRequest;
import com.byteforge.entity.CollegeAssessment;
import com.byteforge.judge.SubmissionEvaluation;
import com.byteforge.repository.CollegeAssessmentRepository;
import com.byteforge.service.AssessmentJudgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for CodeChef College Offering Assessments.
 * Handles faculty creating and managing lab coding assessments and tests,
 * secure student problem access, and verified backend judging.
 */
@RestController
@RequestMapping("/api/college/assessments")
@RequiredArgsConstructor
public class CollegeAssessmentController {

    private final CollegeAssessmentRepository assessmentRepository;
    private final com.byteforge.repository.AssessmentSubmissionRepository submissionRepository;
    private final com.byteforge.service.PlagiarismService plagiarismService;
    private final com.byteforge.repository.AssessmentProblemRepository problemRepository;
    private final AssessmentJudgeService assessmentJudgeService;

    @GetMapping("/{id}/problems")
    public ResponseEntity<List<com.byteforge.dto.AssessmentProblemDto>> getAssessmentProblems(
            @PathVariable Long id,
            Authentication authentication) {

        List<com.byteforge.entity.AssessmentProblem> problems = problemRepository
                .findByAssessmentIdOrderByOrderIndexAsc(id);

        // Security check: Only FACULTY_ADMIN and ADMIN are permitted to inspect hidden
        // test cases.
        // For students taking the exam, hiddenTestCasesJson is masked to "[]" to
        // prevent cheating.
        boolean isFacultyOrAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_FACULTY_ADMIN"));

        List<com.byteforge.dto.AssessmentProblemDto> dtos = problems.stream()
                .map(p -> mapProblemToDto(p, isFacultyOrAdmin))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{id}/problems")
    public ResponseEntity<com.byteforge.dto.AssessmentProblemDto> addAssessmentProblem(
            @PathVariable Long id,
            @Valid @RequestBody com.byteforge.dto.CreateAssessmentProblemRequest request) {

        // Ensure assessment exists
        if (!assessmentRepository.existsById(id)) {
            throw new RuntimeException("Assessment not found with id: " + id);
        }

        long count = problemRepository.countByAssessmentId(id);

        com.byteforge.entity.AssessmentProblem problem = com.byteforge.entity.AssessmentProblem.builder()
                .assessmentId(id)
                .title(request.title())
                .difficulty(request.difficulty() != null && !request.difficulty().isBlank() ? request.difficulty()
                        : "MEDIUM")
                .points(request.points() != null && request.points() > 0 ? request.points() : 50)
                .description(request.description())
                .constraints(request.constraints() != null ? request.constraints() : "1 <= N <= 10^5")
                .inputFormat(request.inputFormat() != null ? request.inputFormat() : "Standard Input")
                .outputFormat(request.outputFormat() != null ? request.outputFormat() : "Standard Output")
                .sampleInput(request.sampleInput() != null ? request.sampleInput() : "")
                .sampleOutput(request.sampleOutput() != null ? request.sampleOutput() : "")
                .hiddenTestCasesJson(request.hiddenTestCasesJson() != null ? request.hiddenTestCasesJson() : "[]")
                .starterCodesJson(request.starterCodesJson() != null ? request.starterCodesJson() : "{}")
                .orderIndex(request.orderIndex() != null ? request.orderIndex() : (int) (count + 1))
                .build();

        com.byteforge.entity.AssessmentProblem saved = problemRepository.save(problem);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapProblemToDto(saved, true));
    }

    @DeleteMapping("/{id}/problems/{problemId}")
    public ResponseEntity<Void> deleteAssessmentProblem(@PathVariable Long id, @PathVariable Long problemId) {
        problemRepository.deleteById(problemId);
        return ResponseEntity.noContent().build();
    }

    private com.byteforge.dto.AssessmentProblemDto mapProblemToDto(com.byteforge.entity.AssessmentProblem p,
            boolean includeHidden) {
        return new com.byteforge.dto.AssessmentProblemDto(
                p.getId(),
                p.getAssessmentId(),
                p.getTitle(),
                p.getDifficulty(),
                p.getPoints(),
                p.getDescription(),
                p.getConstraints(),
                p.getInputFormat(),
                p.getOutputFormat(),
                p.getSampleInput(),
                p.getSampleOutput(),
                includeHidden ? p.getHiddenTestCasesJson() : "[]",
                p.getStarterCodesJson(),
                p.getOrderIndex(),
                p.getCreatedAt());
    }

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(@Valid @RequestBody CreateAssessmentRequest request) {
        CollegeAssessment assessment = CollegeAssessment.builder()
                .cohort(request.cohort() != null ? request.cohort() : "CSE General")
                .assessmentName(request.assessmentName())
                .startTime(request.startTime() != null && !request.startTime().isBlank() ? request.startTime()
                        : "2026-09-05 10:00:00")
                .durationDays(request.durationDays() != null ? request.durationDays() : 0)
                .durationHours(request.durationHours() != null ? request.durationHours() : 1)
                .durationMins(request.durationMins() != null ? request.durationMins() : 30)
                .syllabus(request.syllabus() != null ? request.syllabus() : "Core Programming")
                .description(request.description() != null ? request.description() : "")
                .browserRestrictions(request.browserRestrictions())
                .enableReview(request.enableReview())
                .hideStudentReport(request.hideStudentReport())
                .maxFlags(request.maxFlags() != null && request.maxFlags() > 0 ? request.maxFlags() : 3)
                .allowedLanguages(request.allowedLanguages() != null ? request.allowedLanguages() : "C,C++,Java,Pyth 3")
                .collegeName(request.collegeName() != null ? request.collegeName() : "Delhi Technological University")
                .status("SCHEDULED")
                .build();

        CollegeAssessment saved = assessmentRepository.save(assessment);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponse>> getAllAssessments(
            @RequestParam(required = false) String college) {
        List<CollegeAssessment> list;
        if (college != null && !college.isBlank()) {
            list = assessmentRepository.findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc(college.trim());
            if (list.isEmpty() && college.contains("DTU")) {
                list = assessmentRepository
                        .findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc("Delhi Technological University");
            }
        } else {
            list = assessmentRepository.findAllByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(list.stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentResponse> getAssessmentById(@PathVariable Long id) {
        CollegeAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found: " + id));
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AssessmentResponse> updateAssessmentStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        CollegeAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found: " + id));
        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            assessment.setStatus(newStatus.trim().toUpperCase());
            CollegeAssessment saved = assessmentRepository.save(assessment);
            return ResponseEntity.ok(mapToResponse(saved));
        }
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    /**
     * Submits and judges a student's assessment solution.
     * Evaluates code against problem test cases, computes partial marks,
     * and assigns deterministic verdict.
     * Enforces assessment lifecycle (rejects if assessment concluded) and prevents duplicate attempts.
     */
    @PostMapping("/{id}/submissions")
    public ResponseEntity<com.byteforge.dto.AssessmentSubmissionResponse> submitAssessment(
            @PathVariable Long id,
            @RequestBody com.byteforge.dto.StudentAssessmentSubmitRequest request,
            Authentication authentication) {

        String studentHandle = request.studentHandle() != null && !request.studentHandle().isBlank()
                ? request.studentHandle()
                : (authentication != null ? authentication.getName() : "student_user");

        String studentName = request.studentName() != null && !request.studentName().isBlank()
                ? request.studentName()
                : studentHandle;

        String problemTitle = request.problemTitle() != null ? request.problemTitle() : "Practical Question 1";
        String language = request.language() != null ? request.language() : "JAVA";
        String sourceCode = request.sourceCode() != null ? request.sourceCode() : "// No code submitted";

        boolean isFacultyOrAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_FACULTY_ADMIN"));

        // Server-Side Status & Deadline Enforcement: Concluded assessments reject new submissions
        CollegeAssessment assessment = assessmentRepository.findById(id).orElse(null);
        if (assessment != null && !isFacultyOrAdmin) {
            String status = assessment.getStatus() != null ? assessment.getStatus().trim().toUpperCase() : "ACTIVE";
            if ("COMPLETED".equals(status) || "PAST".equals(status)) {
                throw new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Assessment has concluded. Submissions are closed.");
            }
        }

        // Single Attempt Policy: Prevent duplicate submissions for the same problem by a student
        if (!isFacultyOrAdmin && submissionRepository.existsByAssessmentIdAndStudentHandleAndProblemTitle(id, studentHandle, problemTitle)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.CONFLICT, "You have already submitted a solution for: " + problemTitle);
        }

        // Verified backend judging against test cases
        SubmissionEvaluation evaluation = assessmentJudgeService.judgeAssessmentSubmission(
                id,
                problemTitle,
                sourceCode,
                language,
                request.tabSwitchFlags());

        com.byteforge.entity.AssessmentSubmission sub = com.byteforge.entity.AssessmentSubmission.builder()
                .assessmentId(id)
                .studentName(studentName)
                .studentHandle(studentHandle)
                .rollNo(request.rollNo() != null ? request.rollNo() : "2023CSB1001")
                .problemTitle(problemTitle)
                .language(language)
                .sourceCode(sourceCode)
                .score(evaluation.score())
                .verdict(evaluation.detailedVerdict())
                .tabSwitchFlags(request.tabSwitchFlags())
                .timeTaken(
                        request.timeTaken() != null ? request.timeTaken() : (evaluation.maxExecutionTimeMs() + " ms"))
                .facultyFeedback(request.tabSwitchFlags() > 3
                        ? ((evaluation.errorMessage() != null && !evaluation.errorMessage().isBlank()
                                ? evaluation.errorMessage() + " | " : "") +
                           "AUTO-TERMINATED: Exceeded maximum proctoring limit (" + request.tabSwitchFlags() + " tab switch violations).")
                        : evaluation.errorMessage())
                .build();

        com.byteforge.entity.AssessmentSubmission saved = submissionRepository.save(sub);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToSubmissionResponse(saved));
    }

    /**
     * Batch submission endpoint: Evaluates and grades multiple problems from an
     * assessment exam session.
     */
    @PostMapping("/{id}/submissions/batch")
    public ResponseEntity<List<com.byteforge.dto.AssessmentSubmissionResponse>> submitAssessmentBatch(
            @PathVariable Long id,
            @RequestBody List<com.byteforge.dto.StudentAssessmentSubmitRequest> requests,
            Authentication authentication) {

        List<com.byteforge.dto.AssessmentSubmissionResponse> responses = new ArrayList<>();
        for (com.byteforge.dto.StudentAssessmentSubmitRequest req : requests) {
            ResponseEntity<com.byteforge.dto.AssessmentSubmissionResponse> res = submitAssessment(id, req,
                    authentication);
            if (res.getBody() != null) {
                responses.add(res.getBody());
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    /**
     * Retrieves all recorded submissions for this assessment made by the current student.
     * Used by the frontend workspace to detect past attempts, resume state, and display final scorecard.
     */
    @GetMapping("/{id}/my-submissions")
    public ResponseEntity<List<com.byteforge.dto.AssessmentSubmissionResponse>> getMyAssessmentSubmissions(
            @PathVariable Long id,
            @RequestParam(required = false) String studentHandle,
            Authentication authentication) {

        String handle = (studentHandle != null && !studentHandle.isBlank())
                ? studentHandle
                : (authentication != null ? authentication.getName() : "student_user");

        List<com.byteforge.dto.AssessmentSubmissionResponse> list = submissionRepository
                .findByAssessmentIdAndStudentHandleOrderBySubmittedAtDesc(id, handle)
                .stream()
                .map(this::mapToSubmissionResponse)
                .toList();

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<com.byteforge.dto.AssessmentSubmissionResponse>> getAssessmentSubmissions(
            @PathVariable Long id) {
        List<com.byteforge.dto.AssessmentSubmissionResponse> list = submissionRepository
                .findByAssessmentIdOrderBySubmittedAtDesc(id)
                .stream()
                .map(this::mapToSubmissionResponse)
                .toList();

        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/submissions/{subId}/grade")
    public ResponseEntity<com.byteforge.dto.AssessmentSubmissionResponse> updateSubmissionGrade(
            @PathVariable Long id,
            @PathVariable Long subId,
            @RequestBody java.util.Map<String, Object> body) {
        com.byteforge.entity.AssessmentSubmission sub = submissionRepository.findById(subId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + subId));

        if (body.containsKey("score")) {
            Object scoreObj = body.get("score");
            if (scoreObj instanceof Number) {
                sub.setScore(((Number) scoreObj).intValue());
            } else if (scoreObj instanceof String) {
                try {
                    sub.setScore(Integer.parseInt((String) scoreObj));
                } catch (NumberFormatException ignored) {
                }
            }
        }
        if (body.containsKey("facultyFeedback")) {
            sub.setFacultyFeedback((String) body.get("facultyFeedback"));
        }
        if (body.containsKey("verdict")) {
            sub.setVerdict((String) body.get("verdict"));
        }

        com.byteforge.entity.AssessmentSubmission updated = submissionRepository.save(sub);

        return ResponseEntity.ok(mapToSubmissionResponse(updated));
    }

    /**
     * Faculty/Admin action: Allows a student to take a reassessment by clearing
     * their previous submission records and resetting their attempt.
     */
    @DeleteMapping("/{id}/submissions/reset")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<java.util.Map<String, Object>> resetStudentSubmissions(
            @PathVariable Long id,
            @RequestParam String studentHandle,
            Authentication authentication) {

        boolean isFacultyOrAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_FACULTY_ADMIN"));

        if (!isFacultyOrAdmin) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only faculty mentors or administrators can grant reassessments.");
        }

        CollegeAssessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Assessment not found with id: " + id));

        int cleared = submissionRepository.findByAssessmentIdAndStudentHandleOrderBySubmittedAtDesc(id, studentHandle).size();
        submissionRepository.deleteByAssessmentIdAndStudentHandle(id, studentHandle);

        return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Reassessment granted for @" + studentHandle + ". Cleared " + cleared + " previous submission(s).",
                "clearedCount", cleared,
                "studentHandle", studentHandle,
                "assessmentId", id
        ));
    }

    @PostMapping("/{id}/reassessment/allow")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<java.util.Map<String, Object>> allowReassessment(
            @PathVariable Long id,
            @RequestParam String studentHandle,
            Authentication authentication) {
        return resetStudentSubmissions(id, studentHandle, authentication);
    }

    @GetMapping("/{id}/plagiarism")
    public ResponseEntity<com.byteforge.dto.PlagiarismReportDto> getPlagiarismReport(
            @PathVariable Long id) {
        com.byteforge.dto.PlagiarismReportDto report = plagiarismService.analyzeAssessmentPlagiarism(id);
        return ResponseEntity.ok(report);
    }

    private com.byteforge.dto.AssessmentSubmissionResponse mapToSubmissionResponse(
            com.byteforge.entity.AssessmentSubmission s) {
        return new com.byteforge.dto.AssessmentSubmissionResponse(
                s.getId(),
                s.getAssessmentId(),
                s.getStudentName(),
                s.getStudentHandle(),
                s.getRollNo(),
                s.getProblemTitle(),
                s.getLanguage(),
                s.getSourceCode(),
                s.getScore(),
                s.getVerdict(),
                s.getTabSwitchFlags(),
                s.getTimeTaken(),
                s.getFacultyFeedback(),
                s.getSubmittedAt());
    }

    private AssessmentResponse mapToResponse(CollegeAssessment a) {
        return new AssessmentResponse(
                a.getId(),
                a.getCohort(),
                a.getAssessmentName(),
                a.getStartTime(),
                a.getDurationDays(),
                a.getDurationHours(),
                a.getDurationMins(),
                a.getSyllabus(),
                a.getDescription(),
                a.isBrowserRestrictions(),
                a.isEnableReview(),
                a.isHideStudentReport(),
                a.getMaxFlags() > 0 ? a.getMaxFlags() : 3,
                a.getAllowedLanguages(),
                a.getCollegeName(),
                a.getStatus(),
                a.getCreatedAt());
    }
}
