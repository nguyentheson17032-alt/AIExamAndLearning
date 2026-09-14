package com.aiexam.learning.paper.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class Ts10SnapshotStoreTest {

    @Test
    void filenameIn_readsTs10SnapshotMarker() {
        assertThat(Ts10SnapshotStore.filenameIn(
                "[[img:/ts10/q/e01-i-01.png]] Phương trình nào sau đây"
        )).isEqualTo("e01-i-01.png");
        assertThat(Ts10SnapshotStore.filenameIn("[[img:/ts10/q/e01-sol-22.png]]"))
                .isEqualTo("e01-sol-22.png");
    }

    @Test
    void filenameIn_ignoresMissingOrUnsafeMarkers() {
        assertThat(Ts10SnapshotStore.filenameIn(null)).isNull();
        assertThat(Ts10SnapshotStore.filenameIn("plain stem")).isNull();
        assertThat(Ts10SnapshotStore.filenameIn("[[img:/ts10/q/../secret.png]]")).isNull();
        assertThat(Ts10SnapshotStore.filenameIn("[[img:/ts10/image12.png]]")).isNull();
    }
}
