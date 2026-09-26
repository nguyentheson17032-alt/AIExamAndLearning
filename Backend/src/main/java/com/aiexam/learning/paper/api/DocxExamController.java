package com.aiexam.learning.paper.api;

import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.paper.domain.DocxExamImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paper-sets")
@RequiredArgsConstructor
public class DocxExamController {

    private final DocxExamImportService docxExamImportService;

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaperSetResponse> importDocx(
            @RequestParam UUID subjectId,
            @RequestParam(required = false) String title,
            @RequestParam MultipartFile file
    ) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("EMPTY_FILE", "Chọn file đề .docx.");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (!filename.toLowerCase().endsWith(".docx")) {
            throw new BusinessRuleException("UNSUPPORTED_FILE", "Chỉ nhận file Word .docx.");
        }
        PaperSetResponse saved = docxExamImportService.importDocx(
                CurrentUser.id(),
                subjectId,
                title,
                filename,
                file.getInputStream()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
