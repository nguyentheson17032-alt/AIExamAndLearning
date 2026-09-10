package com.aiexam.learning.user.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RankCodeTest {

    @Test
    void fromElo_mapsBandBoundaries() {
        assertThat(RankCode.fromElo(999)).isEqualTo(RankCode.BRONZE);
        assertThat(RankCode.fromElo(1000)).isEqualTo(RankCode.SILVER);
        assertThat(RankCode.fromElo(1200)).isEqualTo(RankCode.GOLD);
        assertThat(RankCode.fromElo(1400)).isEqualTo(RankCode.PLATINUM);
        assertThat(RankCode.fromElo(1600)).isEqualTo(RankCode.DIAMOND);
    }
}
