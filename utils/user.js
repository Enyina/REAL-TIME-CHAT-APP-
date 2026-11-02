const users = [];

exports.userJoin = (id, username, room) => {
  const existingIndex = users.findIndex(user => user.id === id);
  if (existingIndex !== -1) users.splice(existingIndex, 1);
  const user = {id, username, room};
  users.push(user);
  return user;
};

exports.getCurrentUser = id => users.find(user => user.id === id);

exports.userLeave = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
  return undefined;
};

exports.getRoomUsers = room => users.filter(user => user.room === room);
