var koa = require('koa');
var app = koa();
var winston = require('winston');

// x-response-time

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  winston.info('%s %s - %s', this.method, this.url, ms);
});

app.use(function *(next) {
	winston.info("this.req", {
		method: this.req.method,
		url: this.req.url,
		headers: this.req.heaers
	});
	yield next;
});

// response

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
winston.info('Listening on port 3000');