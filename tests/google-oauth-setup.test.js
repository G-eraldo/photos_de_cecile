import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createGoogleSetupSessionToken,
  verifyGoogleSetupSessionToken,
} from "../server/utils/google-oauth-setup.js";

const secret = "test-only-google-setup-secret-with-sufficient-length";
const now = 1_800_000_000_000;

test("Google setup session requires a valid signature and expires server-side", () => {
  const token = createGoogleSetupSessionToken(secret, now);

  assert.equal(verifyGoogleSetupSessionToken(token, secret, now), true);
  assert.equal(verifyGoogleSetupSessionToken(token, secret, now + 599_999), true);
  assert.equal(verifyGoogleSetupSessionToken(token, secret, now + 600_000), false);
  assert.equal(verifyGoogleSetupSessionToken(token, "different-secret", now), false);
  assert.equal(verifyGoogleSetupSessionToken("a".repeat(43), secret, now), false);
  const changedLastCharacter = token.endsWith("A") ? "B" : "A";
  assert.equal(verifyGoogleSetupSessionToken(`${token.slice(0, -1)}${changedLastCharacter}`, secret, now), false);
});
