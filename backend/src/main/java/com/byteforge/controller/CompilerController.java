package com.byteforge.controller;

import com.byteforge.dto.CompilerRequest;
import com.byteforge.dto.CompilerResponse;
import com.byteforge.service.JudgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public REST Controller for the Online Compiler / IDE.
 * Allows executing code with custom input without creating a persistent submission.
 */
@RestController
@RequestMapping("/api/compiler")
@RequiredArgsConstructor
public class CompilerController {

    private final JudgeService judgeService;

    @PostMapping("/run")
    public ResponseEntity<CompilerResponse> runCode(@Valid @RequestBody CompilerRequest request) {
        CompilerResponse response = judgeService.runCustomCode(
                request.code(),
                request.language(),
                request.input()
        );
        return ResponseEntity.ok(response);
    }
}
