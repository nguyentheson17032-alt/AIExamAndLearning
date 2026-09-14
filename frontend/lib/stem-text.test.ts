import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { storedImageSrc } from "../components/stem-text";

describe("storedImageSrc", () => {
  it("prefers the database image API over the public snapshot path", () => {
    assert.equal(
      storedImageSrc("11111111-1111-1111-1111-111111111111", "[[img:/ts10/q/e01-i-01.png]] stem"),
      "/api/question-images/11111111-1111-1111-1111-111111111111",
    );
  });

  it("falls back to the public snapshot marker", () => {
    assert.equal(storedImageSrc(null, "[[img:/ts10/q/e01-i-01.png]] stem"), "/ts10/q/e01-i-01.png");
  });
});
