const { mongoose } = require('./connection');
const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: "-",
    required: false
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    default: "-"
  },
  company: {
    type: String,
    default: "-"
  },
  type: {
    type: String,
    default: "user"
  },
  status: {
    type: String,
    default: "0"
  },
  right: {
    type: String,
    default: "-"
  },
  message: {
    type: String,
    default: "-"
  },
  location: {
    type: String,
    default: "default",
  },
  group: {
    type: String,
    default: "default",
  },
  note: {
    type: String,
    default: "-",
  },
  logo_url: {
    type: String,
    default: "-",
  }
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
