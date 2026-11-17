import test from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "./enquiry.ts";

const good = { name: "Asha Rao", email: "asha@example.com", message: "Interested in gifting sets." };

test("accepts a valid enquiry and trims", () => {
  const r = validateEnquiry({ ...good, name: "  Asha Rao " });
  assert.deepEqual(r, { ok: true, value: good });
});
test("rejects bad fields", () => {
  for (const [patch, key] of [
    [{ name: "A" }, "name"],
    [{ email: "nope" }, "email"],
    [{ email: "a b@c.d" }, "email"],
    [{ message: "short" }, "message"],
    [{ message: "x".repeat(2001) }, "message"],
    [{ company: "bot" }, "form"],
  ] as const) {
    const r = validateEnquiry({ ...good, ...patch });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.errors[key], key);
  }
});
test("rejects non-objects", () => {
  for (const v of [null, "x", 3, undefined]) assert.equal(validateEnquiry(v).ok, false);
});
