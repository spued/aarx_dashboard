const db = require('../model');
const logger = require('../lib/logger');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function hashPassword(pwd) {
  return new Promise((res, rej) => bcrypt.hash(pwd, bcrypt.genSaltSync(), (err, hash) => {
    if (err) rej(new PasswordHashFailed());
    else res(hash);
  }));
}

const getDefaultPage = (req,res) => {
    console.log("Controller: Main: Get main page");
    res.render('pages/login');
}
const getRegisterPage = (req,res) => {
    console.log("Controller: Main: Get register page");
    res.render('pages/register');
}
const getHealth = (req, res) => {
    if (isConnected()) return res.status(200).end();
    return res.status(httpStatus.SERVICE_UNAVAILABLE).send({ error: 'Database not connected' });
}

const post_register_user = async (req, res) => {
    resData = {
        code : 1,
        msg : 'Error : Default'
    };
    //console.log(req.body);
    const h_password = await hashPassword(req.body.password);
    const _uuid = uuidv4();
    const user_data = {
      email : req.body.username,
      username : req.body.username,
      uuid : _uuid,
      password : h_password,
      //password_confirm : req.password_confirm,
      fullname : req.body.full_name,
      company : req.body.company_name,
      message : req.body.request_message
    };
    

    try {
      const exist = await db.userExist('email', req.body.username);
      if (exist) {
        resData.code = 409;
        resData.msg = 'User already exist or an error occured';
        res.render('pages/register_failed', resData);
      }
      await db.addUser(user_data);
      resData.code = 0;
      resData.msg = 'OK';
      res.render('pages/register_ok', resData);
    } catch (e) {
      logger.error(e);
      resData.code = 500;
      resData.msg = 'Internal error occured';
      res.render('pages/register_failed',resData);
    }
}

module.exports = {
    getDefaultPage,
    getRegisterPage,
    getHealth,

    post_register_user
}