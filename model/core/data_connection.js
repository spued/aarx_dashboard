const mysql = require('promise-mysql');
const logger = require('../../lib/logger');


const db_config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
};

var data_conn = mysql.createPool(db_config);
//console.log(data_conn);
/* data_conn.connect(function(err) {
  if (err) throw err;
  logger.info("Data DB : SQL Connected!");
}); */

module.exports = {
   data_conn 
}