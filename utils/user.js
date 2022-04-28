const users = [];
//USER JOINS CHAT
exports.userJoin = (id, username, room) => {
  const user = { id, username, room };

  users.push(user);

  return user;
};
//GET CURRENT USER
exports.getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

//USER LEAVES CHAT
exports.userLeave = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//GET ROOM USERS
exports.getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};
