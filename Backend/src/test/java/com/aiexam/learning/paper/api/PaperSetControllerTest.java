package com.aiexam.learning.paper.api;

import com.aiexam.learning.auth.domain.JwtService;
import com.aiexam.learning.common.exception.ProblemDetailExceptionHandler;
import com.aiexam.learning.paper.domain.PaperSetService;
import com.aiexam.learning.question.domain.ContentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaperSetController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ProblemDetailExceptionHandler.class)
class PaperSetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaperSetService paperSetService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void list_returnsPublishedSets() throws Exception {
        UUID id = UUID.fromString("11111111-1111-1111-1111-111111111111");
        when(paperSetService.listPublished(null)).thenReturn(List.of(new PaperSetResponse(
                id,
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                UUID.fromString("33333333-3333-3333-3333-333333333333"),
                "Bộ 30 đề Toán tuyển sinh 10",
                "2025-2026",
                "Thang điểm 10",
                ContentStatus.PUBLISHED,
                30,
                Instant.parse("2026-09-12T00:00:00Z"),
                List.of()
        )));

        mockMvc.perform(get("/api/v1/paper-sets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Bộ 30 đề Toán tuyển sinh 10"))
                .andExpect(jsonPath("$[0].paperCount").value(30));
    }

    @Test
    void list_withSubjectId_returnsSetsForSubject() throws Exception {
        UUID subjectId = UUID.fromString("33333333-3333-3333-3333-333333333333");
        UUID setId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        when(paperSetService.listPublished(subjectId)).thenReturn(List.of(new PaperSetResponse(
                setId,
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                subjectId,
                "Bộ 30 đề Toán tuyển sinh 10",
                "2025-2026",
                "Thang điểm 10",
                ContentStatus.PUBLISHED,
                30,
                Instant.parse("2026-09-12T00:00:00Z"),
                List.of()
        )));

        mockMvc.perform(get("/api/v1/paper-sets").param("subjectId", subjectId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subjectId").value(subjectId.toString()))
                .andExpect(jsonPath("$[0].paperCount").value(30));
    }
}
