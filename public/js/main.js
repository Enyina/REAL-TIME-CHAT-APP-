const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
const socket = io();
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  roomName.textContent = room;
  outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("joinError", (message) => outputNotice(message));
socket.on("chatError", (message) => outputNotice(message));

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.target.elements.msg;
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit("chatMessage", msg);
  input.value = "";
  input.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const meta = document.createElement("p");
  meta.classList.add("meta");
  meta.textContent = String(message.username || "");
  const time = document.createElement("span");
  time.textContent = " " + String(message.time || "");
  meta.appendChild(time);
  const body = document.createElement("p");
  body.classList.add("text");
  body.textContent = String(message.text || "");
  div.appendChild(meta);
  div.appendChild(body);
  chatMessages.appendChild(div);
}

function outputNotice(message) {
  outputMessage({ username: "Chat", text: message, time: "" });
}

function outputUsers(users) {
  userList.replaceChildren();
  for (const user of users) {
    const item = document.createElement("li");
    item.textContent = String(user.username || "");
    userList.appendChild(item);
  }
}
