const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const DURATION_UNITS_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDurationMs(duration) {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration string: ${duration}`);
  }
  return Number(match[1]) * DURATION_UNITS_MS[match[2]];
}

function signAccessToken({ userId, role, email }) {
  return jwt.sign({ userId, role, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken() {
  const token = crypto.randomBytes(40).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

function getRefreshTokenExpiry() {
  return new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));
}

module.exports = {
  signAccessToken,
  hashToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
};
