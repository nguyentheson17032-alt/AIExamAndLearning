import assert from "node:assert/strict";
import { test } from "node:test";
import { problemMessage } from "./problem";

test("problemMessage prefers detail over title", () => {
  assert.equal(problemMessage({ title: "Bad Request", detail: "Email taken" }), "Email taken");
});

test("problemMessage falls back to title then default", () => {
  assert.equal(problemMessage({ title: "Unauthorized" }), "Unauthorized");
  assert.equal(problemMessage(null, "Login failed"), "Login failed");
});
