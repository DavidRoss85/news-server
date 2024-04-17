require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const dbHandler = require('./db/dbHandler');
const { systemLog } = require('./logs/logHandler')
const { sleep } = require('./js/utils');
const { importCache } = require('./js/cacheHandler');

const indexRouter = require('./routes/indexRouter');
const newsRouter = require('./routes/newsRouter');
const userRouter = require('./routes/userRouter');
const testingRouter = require('./routes/testingRouter');

const app = express();

sleep(500) //wait half a second to begin
  .then(() => {
    systemLog('System start', 'OK!');
    systemLog('\n\n************\n************\nBEGIN SERVER\n************\n************', { consoleShow: true, logFile: false, lineBreak: '<none>' })
    dbHandler.connectToDatabase();
    importCache(); //Automatically load last search cache from file
  });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

//Routers:
app.use('/', indexRouter);
app.use('/news', newsRouter);
app.use('/users', userRouter);
app.use('/test', testingRouter);
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
