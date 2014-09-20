var thunkify = require('thunkify');
var mongoose = require('mongoose') 
var schema = new mongoose.Schema({
    author: {type: String, default: 'Anon'},
    post: String
});
 
schema.method('persist', thunkify(function(){
	return this.save.apply(this, arguments);
}));

module.exports = mongoose.model('Post', schema);