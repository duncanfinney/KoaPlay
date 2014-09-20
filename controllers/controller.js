var logger = require('winston');
var Post = require('../models/post');
module.exports.get = function*() {
	logger.info('controller-get');
	var posts = yield Post.find({}).exec();
	this.body = posts;
};

module.exports.createPost = function*() {
	logger.info('controller-post');
	var newPost = new Post({
		author: 'Duncan',
		post: 'testing1234'
	});
	yield newPost.persist();
}

module.exports.throwError = function*() {
	var posts = yield Post.find({}).exec();
	var err = new Error('look! async error that is handled properly');
	err.status = 400;
	throw err;
}

module.exports.throwError2 = function*() {
	var posts = yield Post.find({}).exec();
	//async programmer error - still fine!
	loggeres.info(posts);
}