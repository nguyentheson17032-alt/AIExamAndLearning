import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveEloAttemptIds } from "./elo-history";

const attempts = [
  {
    id: "newer",
    eloBefore: 1197,
    eloAfter: 1191,
    eloDelta: -6,
    gradedAt: "2026-09-26T17:16:06.500Z",
  },
  {
    id: "older-same-swing",
    eloBefore: 1197,
    eloAfter: 1191,
    eloDelta: -6,
    gradedAt: "2026-09-01T00:00:00.000Z",
  },
];

test("resolveEloAttemptIds prefers the explicit attempt id", () => {
  const [id] = resolveEloAttemptIds(
    [
      {
        attemptId: "explicit",
        ratingBefore: 1197,
        ratingAfter: 1191,
        delta: -6,
        createdAt: "2026-09-26T17:16:06.507Z",
      },
    ],
    attempts,
  );
  assert.equal(id, "explicit");
});

test("resolveEloAttemptIds matches the graded attempt closest in time", () => {
  const [id] = resolveEloAttemptIds(
    [
      {
        ratingBefore: 1197,
        ratingAfter: 1191,
        delta: -6,
        createdAt: "2026-09-26T17:16:06.507Z",
      },
    ],
    attempts,
  );
  assert.equal(id, "newer");
});

test("resolveEloAttemptIds matches when the stored deltas differ", () => {
  const [id] = resolveEloAttemptIds(
    [{ ratingBefore: 1162, ratingAfter: 1172, delta: 7, createdAt: "2026-09-26T13:26:00.000Z" }],
    [{ id: "paper", eloBefore: 1162, eloAfter: 1172, eloDelta: 10, gradedAt: "2026-09-26T13:26:00.000Z" }],
  );
  assert.equal(id, "paper");
});

test("resolveEloAttemptIds uses each attempt once", () => {
  const ids = resolveEloAttemptIds(
    [
      { ratingBefore: 1197, ratingAfter: 1191, delta: -6, createdAt: "2026-09-26T17:16:06.507Z" },
      { ratingBefore: 1197, ratingAfter: 1191, delta: -6, createdAt: "2026-09-01T00:00:01.000Z" },
    ],
    attempts,
  );
  assert.deepEqual(ids, ["newer", "older-same-swing"]);
});
