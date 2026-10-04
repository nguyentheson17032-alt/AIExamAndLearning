package com.aiexam.learning.ai.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MathGenerateTutorRequest {
    private String category;
    private String difficulty;
    private Integer count;
    private Integer elo;

    @JsonProperty("subject_name")
    @JsonAlias({"subjectName", "subject_name", "subject"})
    private String subjectName;
}

