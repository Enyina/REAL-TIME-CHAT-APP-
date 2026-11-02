const test = require("node:test");
const assert = require("node:assert/strict");
const { parseIdentity, normalizeMessage, MAX_MESSAGE_LENGTH } = require("../utils/chatValidation");
const { userJoin, userLeave, getRoomUsers, getCurrentUser } = require("../utils/user");

test("accepts a trimmed identity and blocks malformed room names", () => {
  assert.deepEqual(parseIdentity({username:"  Alex  ",room:" Dev Chat "}), {username:"Alex",room:"Dev Chat"});
  for (const input of [null, [], {}, {username:"",room:"test"}, {username:"a",room:""}, {username:1,room:"test"}, {username:"a",room:"\nBad"}, {username:"x".repeat(49),room:"test"}]) {
    assert.equal(parseIdentity(input), null);
  }
});

test("accepts text but rejects empty, huge and non-text messages", () => {
  assert.equal(normalizeMessage(" Hello everyone "), "Hello everyone");
  assert.equal(normalizeMessage("<script>alert('test')</script>"), "<script>alert('test')</script>");
  for (const value of ["", "    ", undefined, {}, "x".repeat(MAX_MESSAGE_LENGTH+1)]) {
    assert.equal(normalizeMessage(value), null);
  }
});

test("a socket cannot accumulate duplicate room memberships", () => {
  userJoin("join-id", "Alex", "blue");
  userJoin("join-id", "Alex", "green");
  assert.equal(getRoomUsers("blue").some(user => user.id === "join-id"), false);
  assert.equal(getRoomUsers("green").filter(user => user.id === "join-id").length, 1);
  assert.equal(getCurrentUser("join-id").room, "green");
  userLeave("join-id");
});

test("user lists only include their own room", () => {
  userJoin("a-id", "Alex", "a");
  userJoin("b-id", "Bola", "b");
  assert.equal(getRoomUsers("a").some(user => user.id === "b-id"), false);
  assert.equal(getRoomUsers("b").some(user => user.id === "a-id"), false);
  userLeave("a-id");
  userLeave("b-id");
});

test("browser code renders received messages as text, never HTML", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const source = fs.readFileSync(path.join(__dirname, "../public/js/main.js"), "utf8");
  assert.match(source, /textContent/);
  assert.doesNotMatch(source, /innerHTML\s*=/);
});

test("server keeps room notices scoped and verifies messages come from joined sockets", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const source = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
  assert.match(source, /if \(!user \|\| !message\)/);
  assert.match(source, /socket\.to\(user\.room\)/);
  assert.doesNotMatch(source, /io\.emit\(\s*["']message["']/);
});
