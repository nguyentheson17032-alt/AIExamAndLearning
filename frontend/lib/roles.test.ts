import assert from "node:assert/strict";
import { test } from "node:test";
import { isStaffRole } from "./roles";

test("isStaffRole is true for teacher and admin", () => {
  assert.equal(isStaffRole("TEACHER"), true);
  assert.equal(isStaffRole("ADMIN"), true);
  assert.equal(isStaffRole("STUDENT"), false);
});
