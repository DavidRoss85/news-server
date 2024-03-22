const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const passport = require('passport');
const dbHandler = require('./db/dbHandler');
const { systemLog } = require('./logs/logHandler')
const { sleep } = require('./js/utils');

const indexRouter = require('./routes/indexRouter');
const newsRouter = require('./routes/newsRouter');
const userRouter = require('./routes/userRouter');
// const cors = require('cors');
// const whitelist = ['http://localhost:3000'];

const app = express();

sleep(3000)
  .then(() => {
    systemLog('System start', 'OK!');
    systemLog('\n\n************\n************\nBEGIN SERVER\n************\n************', { consoleShow: true, logFile: false, lineBreak: '<none>' })
    dbHandler.connectToDatabase();
  });



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS STUFF:
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json')
  res.appendHeader('Access-Control-Allow-Origin', '*');
  res.appendHeader('Access-Control-Allow-Credentials', 'true');
  res.appendHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next();
});


app.use(passport.initialize());

//Routers:
app.use('/', indexRouter);
app.use('/news', newsRouter);
app.use('/users', userRouter);
// app.use('/login',loginRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports.newsFeedServer = app;
// module.exports = app;
