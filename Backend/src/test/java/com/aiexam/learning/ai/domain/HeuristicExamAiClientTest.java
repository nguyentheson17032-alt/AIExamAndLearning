package com.aiexam.learning.ai.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class HeuristicExamAiClientTest {

    private final HeuristicExamAiClient client = new HeuristicExamAiClient();

    @Test
    void classify_setsTagsAndEloForEssay() {
        Question question = sample(QuestionType.ESSAY, "Phân tích vai trò của đạo hàm");
        ExamAiClient.ClassificationResult result = client.classify(question);
        assertThat(result.tags()).isNotEmpty();
        assertThat(result.eloRating()).isGreaterThan(1000);
        assertThat(result.modelName()).isEqualTo(HeuristicExamAiClient.MODEL);
    }

    @Test
    void grade_shortAnswer_matchesNormalizedKey() {
        Question question = sample(QuestionType.SHORT_ANSWER, "Căn bậc hai của 9?");
        ExamAiClient.GradeResult result = client.grade(question, "  3 ", BigDecimal.ONE);
        assertThat(result.correct()).isTrue();
        assertThat(result.score()).isEqualByComparingTo("1.00");
    }

    @Test
    void generateSimilar_prefixesVariantStem() {
        Question question = sample(QuestionType.MULTIPLE_CHOICE, "2 + 2 = ?");
        var generated = client.generateSimilar(question, 2);
        assertThat(generated).hasSize(2);
        assertThat(generated.getFirst().stem()).startsWith("[Biến thể 1]");
    }

    @Test
    void generateSimilar_trueFalseHasDungSaiChoices() {
        Question question = sample(QuestionType.TRUE_FALSE, "2 + 2 = 4");
        var generated = client.generateSimilar(question, 4);
        assertThat(generated).hasSize(4);
        assertThat(generated.getFirst().choices()).extracting(ExamAiClient.GeneratedChoice::label)
                .containsExactly("Đ", "S");
    }

    @Test
    void generateSimilar_trueFalseUsesAnswerKeyWhenChoicesMissing() {
        Question question = sample(QuestionType.TRUE_FALSE, "2 + 2 = 5");
        var generated = client.generateSimilar(question, 1);
        assertThat(generated.getFirst().choices()).extracting(ExamAiClient.GeneratedChoice::correct)
                .containsExactly(false, true);
    }

    @Test
    void generateSimilar_trueFalseKeepsSaiAsCorrectChoice() {
        Question question = sample(QuestionType.TRUE_FALSE, "2 + 2 = 5");
        question.addChoice("Đ", "Đúng", false, 1);
        question.addChoice("S", "Sai", true, 2);
        var generated = client.generateSimilar(question, 1);
        assertThat(generated.getFirst().choices()).extracting(ExamAiClient.GeneratedChoice::correct)
                .containsExactly(false, true);
    }

    private Question sample(QuestionType type, String stem) {
        User author = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        Subject subject = Subject.create("MATH", "Toán", null);
        return Question.create(
                author,
                subject,
                null,
                type,
                stem,
                "3",
                null,
                Difficulty.BEGINNER,
                900,
                null,
                QuestionSource.MANUAL,
                ContentStatus.PUBLISHED,
                null
        );
    }
}
