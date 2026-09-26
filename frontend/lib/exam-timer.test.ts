import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCountdown, isLastMinute, remainingMs } from "./exam-timer";

const startedAt = "2026-09-26T07:00:00.000Z";
const startMs = Date.parse(startedAt);

describe("exam timer", () => {
  it("counts down from the attempt start and paper duration", () => {
    assert.equal(remainingMs(startedAt, 90, startMs), 90 * 60_000);
    assert.equal(remainingMs(startedAt, 90, startMs + 60_000), 89 * 60_000);
    assert.equal(remainingMs(startedAt, 90, startMs + 90 * 60_000), 0);
    assert.equal(remainingMs(startedAt, 90, startMs + 91 * 60_000), 0);
    assert.equal(remainingMs("not-a-date", 90, startMs), 0);
  });

  it("marks only the last minute", () => {
    assert.equal(isLastMinute(60_001), false);
    assert.equal(isLastMinute(60_000), true);
    assert.equal(isLastMinute(1), true);
    assert.equal(isLastMinute(0), false);
  });

  it("formats the countdown as minutes and seconds", () => {
    assert.equal(formatCountdown(60_000), "01:00");
    assert.equal(formatCountdown(59_000), "00:59");
    assert.equal(formatCountdown(0), "00:00");
    assert.equal(formatCountdown(90 * 60_000), "90:00");
  });
});
