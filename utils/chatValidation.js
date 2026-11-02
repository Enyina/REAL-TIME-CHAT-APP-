const MAX_USERNAME_LENGTH = 48;
const MAX_ROOM_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 2000;

function normalizeLabel(value, maximum) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maximum || /[\x00-\x1f\x7f]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function parseIdentity(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const username = normalizeLabel(payload.username, MAX_USERNAME_LENGTH);
  const room = normalizeLabel(payload.room, MAX_ROOM_LENGTH);
  return username && room ? { username, room } : null;
}

function normalizeMessage(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= MAX_MESSAGE_LENGTH ? text : null;
}

module.exports = { parseIdentity, normalizeMessage, MAX_MESSAGE_LENGTH };
