const { DbNoResult } = require('../../errors');
const { User } = require('../core/Schemas');

function addUser(data) {
  console.log('Model: Add user: ' + data.email);
  console.log(data);
  const u = new User(data);
  return u.save();
}

async function getUserFromField(field, value) {
  const u = await User.findOne({ [field]: value });
  if (!u) throw new DbNoResult();
  return u;
}

async function userExist(field, value) {
  const u = await User.findOne({ [field]: value });
  if (u) return true;
  return false;
}

function modifyUserPassword(id, pwd) {
  return User.findOneAndUpdate({ _id: id }, { password: pwd });
}

module.exports = {
  addUser,
  getUserFromField,
  userExist,
  modifyUserPassword,
};
