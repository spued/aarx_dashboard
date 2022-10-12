const papa = require('papaparse');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const dotenv = require('dotenv').config();
const app = express();
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

// set the view engine to ejs
app.set('view engine', 'ejs');

const logger = require('./lib/logger');

let allowedCORS;

if (process.env.CORS_WHITELIST) [allowedCORS] = papa.parse(process.env.CORS_WHITELIST).data;
else logger.warn('no allowed CORS found');

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (allowedCORS && allowedCORS.indexOf(origin) > -1) res.setHeader('Access-Control-Allow-Origin', origin);

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, Authorization, '
    + 'x-id, Content-Length, X-Requested-With',
  );
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS');

  next();
});

app.use(helmet());
app.use('/pub', express.static(__dirname + '/pub'))
app.use(cookieParser());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(session({
  secret: 'ewrew3432fdg5456gr54ty5tv3w4tr3t534trw4rqw4',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('dev', {
  skip: (req) => {
    if (req.url === '/health') return true;
    return false;
  },
  stream: logger.stream,
}));

//app.use(require('./routes/user')(passport));
app.use(require('./routes/main')(passport));

app.listen(8081,() => logger.info('Listening on ' + process.env.APP_PORT));

module.exports = app;
