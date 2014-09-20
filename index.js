var koa = require('koa');
var router = require('koa-router');
var mongoose = require('mongoose');
var logger = require('winston');
var controller = require('./controllers/controller');

var app = koa();
mongoose.connect('mongodb://localhost/test');

//Middleware
app.use(function *(next){
  //error handler 
  try {
    yield next;
  } catch (ex) {
    logger.info('caught exception: ', ex.status, ex.name + ' ' + ex.message);
    logger.info(ex.stack)
  }
});

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  logger.info('%s %s - %s ms', this.method, this.url, ms);
});

// API hooks
app.use(router(app));
app.get('/', controller.get);
app.get('/createPost', controller.createPost);
app.get('/throwError', controller.throwError);
app.get('/throwError2', controller.throwError2);

//showing how policies would be made
// var policies = function() {
//   return [
//     function*(next) {
//       logger.info('middleware1');
//       yield next;
//     },
//     function*(next) {
//       logger.info('middleware2');
//       yield next;
//     }
//   ];
// }
// app.get('/policiesTest', policies(), controller.get);


app.listen(3000);
logger.info('Listening on port 3000');