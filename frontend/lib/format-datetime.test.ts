import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDateTime } from "./format-datetime";

test("formatDateTime uses a fixed locale and timezone", () => {
  assert.equal(formatDateTime("2026-09-14T12:00:00.000Z"), "14 Sept 2026, 19:00");
});

test("formatDateTime returns the original string when invalid", () => {
  assert.equal(formatDateTime("not-a-date"), "not-a-date");
});
