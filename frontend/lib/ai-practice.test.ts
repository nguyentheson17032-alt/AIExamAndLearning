import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiPracticeDurationMinutes } from "./ai-practice";

describe("AI practice duration", () => {
  it("is question count times 0.5 minutes (30s/question)", () => {
    assert.equal(aiPracticeDurationMinutes(1), 1);
    assert.equal(aiPracticeDurationMinutes(4), 2);
    assert.equal(aiPracticeDurationMinutes(5), 3);
    assert.equal(aiPracticeDurationMinutes(10), 5);
  });

  it("clamps count below 100", () => {
    assert.equal(aiPracticeDurationMinutes(0), 1);
    assert.equal(aiPracticeDurationMinutes(99), 50);
    assert.equal(aiPracticeDurationMinutes(200), 50);
  });
});
