package com.aiexam.learning.ai.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MathEvaluateRequest {
    @JsonAlias({"problem", "exercise", "question"})
    @JsonProperty("problem")
    private Object problem;

    @JsonAlias({"user_answer", "userAnswer", "answer", "choice", "selectedOption"})
    @JsonProperty("userAnswer")
    private String userAnswer;

    public Object problem() {
        return problem;
    }

    public String userAnswer() {
        return userAnswer;
    }
}


