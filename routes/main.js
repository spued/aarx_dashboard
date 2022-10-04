const routes = require('express').Router();
const httpStatus = require('http-status-codes');
const { isConnected } = require('../model/tools/info');
const main = require('../controller/controller_main');

module.exports = () => {
    // index page
    routes.get('/', main.getDefaultPage);
    routes.get('/register_request', main.getRegisterPage);
    routes.get('/health', main.getHealth);
    return routes;
};