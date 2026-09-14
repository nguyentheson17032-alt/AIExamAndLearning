import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateDurationMinutes, generateEloRange } from "./paper-generate";

describe("paper-generate defaults", () => {
  it("uses 2 minutes and Elo 1000-1100 for Phần I", () => {
    assert.equal(generateDurationMinutes("PART_I", 10), 20);
    assert.deepEqual(generateEloRange("PART_I"), { min: 1000, max: 1100 });
  });

  it("uses 6 minutes and Elo 1100-1200 for Phần II", () => {
    assert.equal(generateDurationMinutes("PART_II", 10), 60);
    assert.deepEqual(generateEloRange("PART_II"), { min: 1100, max: 1200 });
  });

  it("uses 3 minutes and Elo 1200+ for Phần III", () => {
    assert.equal(generateDurationMinutes("PART_III", 10), 30);
    assert.deepEqual(generateEloRange("PART_III"), { min: 1200, max: 3000 });
  });
});
