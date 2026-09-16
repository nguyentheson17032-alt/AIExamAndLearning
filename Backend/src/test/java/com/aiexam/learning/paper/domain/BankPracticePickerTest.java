package com.aiexam.learning.paper.domain;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BankPracticePickerTest {

    @Test
    void pool_dropsIncompleteTrueFalseGroups() {
        UUID mcq = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID a = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID b = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID c = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID d = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        var pool = BankPracticePicker.pool(
                List.of(mcq),
                List.of(),
                List.of(List.of(a, b, c), List.of(a, b, c, d))
        );
        assertThat(pool).hasSize(2);
        assertThat(pool.get(1)).isInstanceOf(BankPracticePicker.TrueFalseGroup.class);
        assertThat(((BankPracticePicker.TrueFalseGroup) pool.get(1)).questionIds()).containsExactly(a, b, c, d);
    }

    @Test
    void pick_keepsTrueFalseGroupsTogether() {
        UUID mcq = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID a = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID b = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID c = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID d = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        var pool = BankPracticePicker.pool(List.of(mcq), List.of(), List.of(List.of(a, b, c, d)));
        var picked = BankPracticePicker.pick(pool, 2, new Random(1));
        assertThat(picked).hasSize(2);
        BankPracticePicker.TrueFalseGroup group = picked.stream()
                .filter(BankPracticePicker.TrueFalseGroup.class::isInstance)
                .map(BankPracticePicker.TrueFalseGroup.class::cast)
                .findFirst()
                .orElseThrow();
        assertThat(group.questionIds()).containsExactly(a, b, c, d);
    }

    @Test
    void pick_returnsEmptyWhenBankIsTooSmall() {
        UUID mcq = UUID.fromString("11111111-1111-1111-1111-111111111111");
        var pool = BankPracticePicker.pool(List.of(mcq), List.of(), List.of());
        assertThat(BankPracticePicker.pick(pool, 2, new Random(1))).isEmpty();
    }

    @Test
    void trueFalseGroup_requiresFourStatements() {
        assertThatThrownBy(() -> new BankPracticePicker.TrueFalseGroup(List.of(UUID.randomUUID())))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("4");
    }
}
