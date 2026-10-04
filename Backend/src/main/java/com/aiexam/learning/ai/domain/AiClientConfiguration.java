package com.aiexam.learning.ai.domain;

import com.aiexam.learning.common.config.AiProperties;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration(proxyBeanMethods = false)
public class AiClientConfiguration {

    @Bean
    @Primary
    ExamAiClient examAiClient(
            AiProperties properties,
            PythonMathAiClient pythonMathAiClient,
            HeuristicExamAiClient heuristic,
            ObjectProvider<ChatClient.Builder> chatClientBuilder
    ) {
        if (!Boolean.TRUE.equals(properties.enabled())) {
            return heuristic;
        }
        // Use Python Math AI Client as preferred engine with fallback
        return pythonMathAiClient;
    }
}

