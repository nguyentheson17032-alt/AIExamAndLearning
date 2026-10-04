package com.aiexam.learning;

import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.config.AiProperties;
import com.aiexam.learning.common.config.EloProperties;
import com.aiexam.learning.common.config.JwtProperties;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ExamWarehouseApplicationTest {

    @Test
    void applicationClass_isLoadable() {
        assertThat(ExamWarehouseApplication.class.getSimpleName()).isEqualTo("ExamWarehouseApplication");
    }

    @Test
    void pageResponse_fromSpringPage_copiesMetadata() {
        var page = new PageImpl<>(List.of("q1"), PageRequest.of(0, 20), 1);
        PageResponse<String> response = PageResponse.from(page);
        assertThat(response.content()).containsExactly("q1");
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(20);
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.last()).isTrue();
    }

    @Test
    void typedProperties_holdConfiguredValues() {
        var jwt = new JwtProperties("secret", Duration.ofMinutes(15), Duration.ofDays(7));
        var elo = new EloProperties(1000, 24);
        var ai = new AiProperties(false, "heuristic", "http://localhost:8000", "http://localhost:8001");
        assertThat(jwt.accessTokenExpiration()).isEqualTo(Duration.ofMinutes(15));
        assertThat(elo.kFactor()).isEqualTo(24);
        assertThat(ai.enabled()).isFalse();
        assertThat(ai.physicsServiceUrl()).isEqualTo("http://localhost:8001");

    }
}
