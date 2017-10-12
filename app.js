let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let fs = require('fs');

let index = require('./routes/index');
let users = require('./routes/users');
let xmlRouter = require('./routes/parser-xml');
let staffRouter = require('./routes/staff');
let largeParser = require('./routes/large-parser');
let disqusExpat = require('./routes/disqus-expat');
let asyncParser = require('./routes/async-parser');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tmp')));

app.use('/', index);
app.use('/users', users);
app.use('/parse', xmlRouter);
app.use('/staff', staffRouter);
app.use('/big', largeParser);
app.use('/expat', disqusExpat);
app.use('/parse/async', asyncParser);

// TODO: Finish implementation for better organization and performance
// app.use('/', function (req, res, next) {
//   let path = req.path;
//   let from = req.query.from;
//   let to = req.query.to;
//   console.log(`Converting ` + path.action + ': From - ' + from.action + ': To - ' + to.action);
//
//   if (req.path === '/disqus') {
//     console.log('Testing route /disqus ...'.cyan);
//   }
//
//   if (from === 'xml' && to === 'json') {
//     console.log('\n>>>> Converting from XML to JSON...'.action);
//   }
//
//   if (from === 'json' && to === 'xml') {
//     console.log('\n>>>> Converting JSON to XML...'.action);
//   }
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
