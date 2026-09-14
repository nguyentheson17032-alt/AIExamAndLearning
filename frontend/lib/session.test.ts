import assert from "node:assert/strict";
import { test } from "node:test";
import { safeInternalPath } from "./safe-path";

test("safeInternalPath keeps app paths", () => {
  assert.equal(safeInternalPath("/attempts"), "/attempts");
  assert.equal(safeInternalPath("/subjects?x=1"), "/subjects?x=1");
});

test("safeInternalPath rejects open redirects", () => {
  assert.equal(safeInternalPath(null), "/");
  assert.equal(safeInternalPath("https://evil.example"), "/");
  assert.equal(safeInternalPath("//evil.example"), "/");
  assert.equal(safeInternalPath("/api/session/clear"), "/");
});
