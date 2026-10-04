package com.aiexam.learning.ai.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorChatRequest {
    @JsonProperty("query")
    private String query;

    @JsonAlias({"current_problem", "currentProblem", "problem"})
    @JsonProperty("currentProblem")
    private Object currentProblem;

    public String query() {
        return query;
    }

    public Object currentProblem() {
        return currentProblem;
    }
}


