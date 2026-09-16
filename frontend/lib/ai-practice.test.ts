import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiPracticeDurationMinutes } from "./ai-practice";

describe("AI practice duration", () => {
  it("is question count times 2.5", () => {
    assert.equal(aiPracticeDurationMinutes(1), 3);
    assert.equal(aiPracticeDurationMinutes(4), 10);
    assert.equal(aiPracticeDurationMinutes(5), 13);
    assert.equal(aiPracticeDurationMinutes(10), 25);
  });

  it("clamps count below 100", () => {
    assert.equal(aiPracticeDurationMinutes(0), 3);
    assert.equal(aiPracticeDurationMinutes(99), 248);
    assert.equal(aiPracticeDurationMinutes(200), 248);
  });
});
