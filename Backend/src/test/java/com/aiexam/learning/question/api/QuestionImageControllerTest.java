package com.aiexam.learning.question.api;

import com.aiexam.learning.auth.domain.JwtService;
import com.aiexam.learning.common.exception.ProblemDetailExceptionHandler;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.question.domain.QuestionImage;
import com.aiexam.learning.question.domain.QuestionImageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = QuestionImageController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ProblemDetailExceptionHandler.class)
class QuestionImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuestionImageService questionImageService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void get_returnsPngBytes() throws Exception {
        UUID id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        byte[] png = {1, 2, 3, 4};
        when(questionImageService.get(id)).thenReturn(QuestionImage.create("e01-i-01.png", "image/png", png));

        mockMvc.perform(get("/api/v1/question-images/" + id))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(png));
    }

    @Test
    void get_whenMissing_returns404() throws Exception {
        UUID id = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        when(questionImageService.get(id))
                .thenThrow(new ResourceNotFoundException("QUESTION_IMAGE_NOT_FOUND", "Image not found: " + id));

        mockMvc.perform(get("/api/v1/question-images/" + id))
                .andExpect(status().isNotFound());
    }
}
