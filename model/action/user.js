const { DbNoResult } = require('../../errors');
const { User } = require('../core/Schemas');

function addUser(data) {
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

async function list_user(field, value) {
  return await User.find({});
}

async function save_user(data) {
  //console.log(data);
  const doc = await User.findOneAndUpdate({ _id : data.user_id }, data, { 
    new: true,
    returnOriginal: false });
  //console.log(doc);
  return doc;
}
async function delete_user(data) {
  //console.log(data);
  const doc = await User.findOneAndDelete({ _id : data.user_id });
  //console.log(doc);
  return doc;
}

module.exports = {
  addUser,
  getUserFromField,
  userExist,
  modifyUserPassword,
  list_user,
  save_user,
  delete_user
};
