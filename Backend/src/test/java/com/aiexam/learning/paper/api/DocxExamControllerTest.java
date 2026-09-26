package com.aiexam.learning.paper.api;

import com.aiexam.learning.auth.domain.JwtService;
import com.aiexam.learning.common.exception.ProblemDetailExceptionHandler;
import com.aiexam.learning.paper.domain.DocxExamImportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DocxExamController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ProblemDetailExceptionHandler.class)
class DocxExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocxExamImportService docxExamImportService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void import_rejectsNonDocx() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "de.pdf", "application/pdf", new byte[] {1});
        mockMvc.perform(multipart("/api/v1/paper-sets/import")
                        .file(file)
                        .param("subjectId", UUID.randomUUID().toString()))
                .andExpect(status().isUnprocessableEntity());
    }
}
