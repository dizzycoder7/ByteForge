package com.byteforge.controller;

import com.byteforge.dto.AssessmentResponse;
import com.byteforge.dto.CreateAssessmentRequest;
import com.byteforge.entity.CollegeAssessment;
import com.byteforge.repository.CollegeAssessmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for CodeChef College Offering Assessments.
 * Handles faculty creating and managing lab coding assessments and tests.
 */
@RestController
@RequestMapping("/api/college/assessments")
@RequiredArgsConstructor
public class CollegeAssessmentController {

    private final CollegeAssessmentRepository assessmentRepository;
    private final com.byteforge.repository.AssessmentSubmissionRepository submissionRepository;
    private final com.byteforge.service.PlagiarismService plagiarismService;
    private final com.byteforge.repository.AssessmentProblemRepository problemRepository;

    @GetMapping("/{id}/problems")
    public ResponseEntity<List<com.byteforge.dto.AssessmentProblemDto>> getAssessmentProblems(@PathVariable Long id) {
        List<com.byteforge.entity.AssessmentProblem> problems = problemRepository.findByAssessmentIdOrderByOrderIndexAsc(id);
        
        // If no problems exist yet for this assessment, return an empty list or seeded defaults
        List<com.byteforge.dto.AssessmentProblemDto> dtos = problems.stream()
                .map(this::mapProblemToDto)
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
                .difficulty(request.difficulty() != null && !request.difficulty().isBlank() ? request.difficulty() : "MEDIUM")
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
        return ResponseEntity.status(HttpStatus.CREATED).body(mapProblemToDto(saved));
    }

    @DeleteMapping("/{id}/problems/{problemId}")
    public ResponseEntity<Void> deleteAssessmentProblem(@PathVariable Long id, @PathVariable Long problemId) {
        problemRepository.deleteById(problemId);
        return ResponseEntity.noContent().build();
    }

    private com.byteforge.dto.AssessmentProblemDto mapProblemToDto(com.byteforge.entity.AssessmentProblem p) {
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
                p.getHiddenTestCasesJson(),
                p.getStarterCodesJson(),
                p.getOrderIndex(),
                p.getCreatedAt()
        );
    }

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(@Valid @RequestBody CreateAssessmentRequest request) {
        CollegeAssessment assessment = CollegeAssessment.builder()
                .cohort(request.cohort() != null ? request.cohort() : "CSE General")
                .assessmentName(request.assessmentName())
                .startTime(request.startTime() != null && !request.startTime().isBlank() ? request.startTime() : "2026-09-05 10:00:00")
                .durationDays(request.durationDays() != null ? request.durationDays() : 0)
                .durationHours(request.durationHours() != null ? request.durationHours() : 1)
                .durationMins(request.durationMins() != null ? request.durationMins() : 30)
                .syllabus(request.syllabus() != null ? request.syllabus() : "Core Programming")
                .description(request.description() != null ? request.description() : "")
                .browserRestrictions(request.browserRestrictions())
                .enableReview(request.enableReview())
                .hideStudentReport(request.hideStudentReport())
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
                list = assessmentRepository.findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc("Delhi Technological University");
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

    @PostMapping("/{id}/submissions")
    public ResponseEntity<com.byteforge.dto.AssessmentSubmissionResponse> submitAssessment(
            @PathVariable Long id,
            @RequestBody com.byteforge.dto.StudentAssessmentSubmitRequest request) {
        com.byteforge.entity.AssessmentSubmission sub = com.byteforge.entity.AssessmentSubmission.builder()
                .assessmentId(id)
                .studentName(request.studentName() != null ? request.studentName() : "Student")
                .studentHandle(request.studentHandle() != null ? request.studentHandle() : "student_user")
                .rollNo(request.rollNo() != null ? request.rollNo() : "2023CSB1001")
                .problemTitle(request.problemTitle() != null ? request.problemTitle() : "Practical Question 1")
                .language(request.language() != null ? request.language() : "JAVA")
                .sourceCode(request.sourceCode() != null ? request.sourceCode() : "// No code submitted")
                .score(request.score() > 0 ? request.score() : 90)
                .verdict(request.verdict() != null ? request.verdict() : "ACCEPTED (10/10 Testcases)")
                .tabSwitchFlags(request.tabSwitchFlags())
                .timeTaken(request.timeTaken() != null ? request.timeTaken() : "35 mins")
                .build();

        com.byteforge.entity.AssessmentSubmission saved = submissionRepository.save(sub);

        return ResponseEntity.status(HttpStatus.CREATED).body(new com.byteforge.dto.AssessmentSubmissionResponse(
                saved.getId(),
                saved.getAssessmentId(),
                saved.getStudentName(),
                saved.getStudentHandle(),
                saved.getRollNo(),
                saved.getProblemTitle(),
                saved.getLanguage(),
                saved.getSourceCode(),
                saved.getScore(),
                saved.getVerdict(),
                saved.getTabSwitchFlags(),
                saved.getTimeTaken(),
                saved.getFacultyFeedback(),
                saved.getSubmittedAt()
        ));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<com.byteforge.dto.AssessmentSubmissionResponse>> getAssessmentSubmissions(
            @PathVariable Long id) {
        List<com.byteforge.dto.AssessmentSubmissionResponse> list = submissionRepository
                .findByAssessmentIdOrderBySubmittedAtDesc(id)
                .stream()
                .map(s -> new com.byteforge.dto.AssessmentSubmissionResponse(
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
                        s.getSubmittedAt()
                ))
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
                } catch (NumberFormatException ignored) {}
            }
        }
        if (body.containsKey("facultyFeedback")) {
            sub.setFacultyFeedback((String) body.get("facultyFeedback"));
        }
        if (body.containsKey("verdict")) {
            sub.setVerdict((String) body.get("verdict"));
        }

        com.byteforge.entity.AssessmentSubmission updated = submissionRepository.save(sub);

        return ResponseEntity.ok(new com.byteforge.dto.AssessmentSubmissionResponse(
                updated.getId(),
                updated.getAssessmentId(),
                updated.getStudentName(),
                updated.getStudentHandle(),
                updated.getRollNo(),
                updated.getProblemTitle(),
                updated.getLanguage(),
                updated.getSourceCode(),
                updated.getScore(),
                updated.getVerdict(),
                updated.getTabSwitchFlags(),
                updated.getTimeTaken(),
                updated.getFacultyFeedback(),
                updated.getSubmittedAt()
        ));
    }

    @GetMapping("/{id}/plagiarism")
    public ResponseEntity<com.byteforge.dto.PlagiarismReportDto> getPlagiarismReport(
            @PathVariable Long id) {
        com.byteforge.dto.PlagiarismReportDto report = plagiarismService.analyzeAssessmentPlagiarism(id);
        return ResponseEntity.ok(report);
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
                a.getAllowedLanguages(),
                a.getCollegeName(),
                a.getStatus(),
                a.getCreatedAt()
        );
    }
}
