const routes = require('express').Router();
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const httpStatus = require('http-status-codes');
const { validating, isLogged } = require('../lib/middleware');
const db = require('../model');
const logger = require('../lib/logger');
const { PasswordNoMatch, PasswordHashFailed, DbNoResult } = require('../errors');
const main = require('../controller/controller_main');
const rx_onu = require('../controller/controller_aarx_onu');

function hashPassword(pwd) {
  return new Promise((res, rej) => bcrypt.hash(pwd, bcrypt.genSaltSync(), (err, hash) => {
    if (err) rej(new PasswordHashFailed());
    else res(hash);
  }));
}

function isValidPassword(pwd, hash) {
  return new Promise((res, rej) => {
    bcrypt.compare(pwd, hash, (err, suc) => {
      if (err || !suc) rej(new PasswordNoMatch());
      else res(suc);
    });
  });
}


const userschema = Joi.object().keys({
  username: Joi.string().email().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  password_confirm: Joi.string().min(4).required(),
  full_name: Joi.string().min(3).max(128),
  company_name: Joi.string().min(3).max(128),
  phone_number: Joi.number().min(7),
  request_message: Joi.string(),
});

const authenSchema = Joi.object().keys({
  username: Joi.string().email().required(),
  password: Joi.string().min(4).required()
});

const changePasswordSchema = Joi.object().keys({
    lastPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
});
module.exports = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' },
      async (username, password, done) => {
        let user = null;
        try {
          user = await db.getUserFromField('username', username);
        } catch (e) {
          if (e instanceof DbNoResult) {
            done(null, false, { error: 'Incorrect username.' });
            return;
          }
          done(e, false, { error: 'Internal server error' });
          return;
        }
        isValidPassword(password, user.password)
          .then(() => {
            done(null, user);
          })
          .catch(() => {
            done(null, false, { error: 'Incorrect password.' });
          });
      }));
  
    passport.serializeUser((user, done) => {
      //console.log('serial user = ' + user._id);
      process.nextTick(function() {
        done(null, user._id);
      })
    });

    passport.deserializeUser((id, done) => {
      //console.log('deserial id = ' + id);
      process.nextTick(function() {
        db.getUserFromField('_id', id)
        .then(u => done(null, u))
        .catch((e) => {
            if (e instanceof DbNoResult) done(null, null);
            else done(e, null);
        });
      })
    });

    routes.post('/register', validating(userschema), main.post_register_user);
  
    // Login using passport middleware
    routes.post('/login', validating(authenSchema),
      passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
      main.post_login_user);
  
    // Simply logs out using passport middleware
    routes.post('/logout', main.post_logout_user);
    routes.post('/changepassword', isLogged, validating(changePasswordSchema), async (req, res) => {
      const { lastPassword } = req.value;
      const { newPassword } = req.value;
  
      try {
        const user = await db.getUserFromField('_id', req.user.id);
        await isValidPassword(lastPassword, user.password);
        const newhash = await hashPassword(newPassword);
        await db.modifyUserPassword(user.id, newhash);
        return res.status(httpStatus.OK).end();
      } catch (e) {
        if (e instanceof DbNoResult) return res.status(httpStatus.BAD_REQUEST).send({ error: 'User not found' });
        if (e instanceof PasswordNoMatch) return res.status(httpStatus.UNAUTHORIZED).send({ error: 'password doesn\'t match' });
        logger.error(e);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error' });
      }
    });
  
    routes.get('/me', isLogged, (req, res) => res.status(httpStatus.OK).send(req.user));
    routes.get('/', isLogged, main.getMainPage);
    routes.get('/aarx_onu', isLogged, main.getAarxOnuPage);
    routes.get('/logout', isLogged, main.getLogoutPage);
    routes.get('/login', isLogged, main.getLoginPage);
    routes.get('/register_request', main.getRegisterPage);
    
    routes.post('/list_ne', main.post_list_ne);
    
    routes.post('/list_pon', isLogged, rx_onu.post_rx_province);
    routes.post('/list_masters', isLogged, rx_onu.post_masters_info);
    routes.post('/list_masters_id', isLogged, rx_onu.post_masters_id);
    routes.post('/count_pon', isLogged, rx_onu.post_count_pon);
    routes.post('/rx_onu', isLogged, rx_onu.post_rx_onu_count);
    routes.post('/rx_pon', isLogged, rx_onu.post_rx_pon_count);

    return routes;
};