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

const getLoginPage = (req,res) => {
    console.log("Controller: Main: Get login page");
    let message = "ok";
    res.render('pages/login', message);
}
const getLogoutPage = async (req,res) => {
  console.log("Controller: Main: Get logout page");
  await req.logout();
  console.log("Controller: Main: Successfuly logout");
  res.render('pages/login');
}
const getMainPage = (req,res) => {
  //console.log(req.user);
  console.log("Controller: Main: Get main page for " + req.user.fullname);
  res.render('pages/main_page', req.user);
}
const getRegisterPage = (req,res) => {
    console.log("Controller: Main: Get register page");
    res.render('pages/register');
}
const getAarxOnuPage = (req,res) => {
  console.log("Controller: Main: Get AARX ONU page");
  db.getOverAllNEData().then(function(rows) {
      // now you have your rows, you can see if there are <20 of them
        //console.log(rows);
  }).catch((err) => setImmediate(() => { throw err; }));
  res.render('pages/aarx_onu', req.user);
}

const post_login_user = async (req, res, next) => {
  console.log("Controller: Main: User logged in = " + req.user.fullname);
  await req.login(req.user, function(err) {
    if (err) { return next(err); }
    return res.render('pages/main_page', req.user);
  });
}
const post_logout_user = async (req, res) => {
  console.log("Controller: Main: User logged in = " + req.user.fullname);
    await req.logout();
    req.session.save();
    req.session.user = '';
    return res.render('pages/login');
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
const post_list_ne = async (req, res) => {
  logger.info("Controller : NE list command.");
  resData = {
      code : 1,
      msg : 'Error : Default'
  };
  db.getOverAllNEData().then((rows) => {
  //console.log(rows);
    resData.data = rows;
    resData.rowCount = rows.length;
    resData.code = 0;
    resData.msg = "OK";
    res.json(resData);
  })
}
module.exports = {
    getLoginPage,
    getLogoutPage,
    getMainPage,
    getRegisterPage,
    getAarxOnuPage,

    post_register_user,
    post_login_user,
    post_logout_user,
    post_list_ne
}