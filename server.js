const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {parseIdentity, normalizeMessage} = require("./utils/chatValidation");
const {getCurrentUser, userJoin, userLeave, getRoomUsers} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Bot";

io.on("connection", (socket) => {
  socket.on("joinRoom", (payload) => {
    const identity = parseIdentity(payload);
    if (!identity) {
      socket.emit("joinError", "Enter a valid username and room.");
      return;
    }
    const existing = getCurrentUser(socket.id);
    if (existing) {
      socket.leave(existing.room);
      userLeave(socket.id);
      io.to(existing.room).emit("roomUsers", {
        room: existing.room,
        users: getRoomUsers(existing.room),
      });
    }
    const user = userJoin(socket.id, identity.username, identity.room);
    socket.join(user.room);

    socket.emit("message", formatMessage(botName, "Welcome to the chat!"));
    socket.to(user.room).emit("message",
      formatMessage(botName, user.username + " has joined the chat")
    );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (raw) => {
    const user = getCurrentUser(socket.id);
    const message = normalizeMessage(raw);
    if (!user || !message) {
      socket.emit("chatError", "Join a room and enter a valid message.");
      return;
    }
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (!user) return;
    socket.to(user.room).emit("message",
      formatMessage(botName, user.username + " has left the chat")
    );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
