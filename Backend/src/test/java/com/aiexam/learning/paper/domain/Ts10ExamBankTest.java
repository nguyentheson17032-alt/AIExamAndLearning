package com.aiexam.learning.paper.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class Ts10ExamBankTest {

    @Test
    void bankHasThirtyExamsWithOfficialShape() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Ts10ExamBank.Bank bank;
        try (InputStream in = new ClassPathResource("data/ts10-2025-2026.json").getInputStream()) {
            bank = mapper.readValue(in, Ts10ExamBank.Bank.class);
        }

        assertThat(bank.academicYear()).isEqualTo("2025-2026");
        assertThat(bank.exams()).hasSize(30);
        assertThat(bank.exams()).allSatisfy(exam -> {
            assertThat(exam.questions()).hasSize(34);
            assertThat(exam.durationMinutes()).isEqualTo(90);
        });

        List<String> partOneKeys = bank.exams().getFirst().questions().stream()
                .filter(item -> item.section() == PaperSection.PART_I)
                .map(Ts10ExamBank.Item::answerKey)
                .toList();
        assertThat(partOneKeys).containsExactly("B", "D", "B", "B", "A", "A", "D", "D", "C", "B", "A", "B");
        Ts10ExamBank.Item first = bank.exams().getFirst().questions().getFirst();
        assertThat(first.stem()).contains("Phương trình nào sau đây");
        assertThat(first.stem()).contains("[[img:/ts10/q/e01-i-01.png]]");
        assertThat(first.stem()).doesNotContain("/ts10/image");
        assertThat(first.explanation()).contains("[[img:/ts10/q/e01-sol-01.png]]");
    }
}
