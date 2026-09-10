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
            HeuristicExamAiClient heuristic,
            ObjectProvider<ChatClient.Builder> chatClientBuilder
    ) {
        if (!Boolean.TRUE.equals(properties.enabled())) {
            return heuristic;
        }
        ChatClient.Builder builder = chatClientBuilder.getIfAvailable();
        if (builder == null) {
            return heuristic;
        }
        return new SpringAiExamClient(builder.build(), properties, heuristic);
    }
}
