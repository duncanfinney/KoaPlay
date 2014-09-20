var koa = require('koa');
var router = require('koa-router');
var app = koa();
app.use(router(app));

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
app.get('/', function *(next) {
	this.body = 'hello world!';
})
app.listen(3000);
winston.info('Listening on port 3000');