var mongoose   = require('mongoose');
var config     = require('../lib/config');
var timestamps = require('./plugins/timestamps');
var indexes    = require('./plugins/indexes');
var uuid       = require('node-uuid');
var _          = require('lodash');
var q          = require('q');

/* contstants */

var dataSources = ['sfdc'];

var programTypes = ['sfdc-leaderboard'];

/* schema definition */

var schema = new mongoose.Schema({
  name             : { type: String, required: true },
  description      : { type: String },
  runningUserId    : { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  organizationId   : { type: mongoose.Schema.ObjectId, ref: 'Organization', required: true },
  public           : { type: Boolean, default: false },
  secretUrl        : { type: String,  index: true },
  restrictIp       : { type: Boolean, default: false },
  ipRanges         : [
    {
      ipStart      : { type: String},
      ipEnd        : { type: String }
    }
  ],
  muted            : { type: Boolean, default: false },
  debug            : { type: Boolean, default: false },
  programs         : [
    {
      credentialId : { type: mongoose.Schema.ObjectId, ref: 'User.credentials' },
      title        : { type: String, required: true },
      programType  : { type: String, enum: programTypes, required: true },
      opts         : { type: Object }, // see examples below
      data         : { type: Object },
      feed         : { type: Object }
    }
  ]
});

/* example sfdc-leaderboard program options */

/*
Comes through on property of credential
{
  orgId: 'sdksljfsdf' // REQUIRED,
  theme: 'sometheme',
  contestId: 'fdksljfdslf',
  maxLeaders: -1 || some integer,
  speed: 1 | 2 | 3?, == 3 is fastest
  splashes: Bool - default true,
  ticker: {
    chatter: Bool - default true,
    actions: Bool - default true,
    prizes:  Bool - default true
  }
}
*/

/* plugins */

/**
 * Add in the "Secret" (public) url
 */
schema.pre('save', function(next) {
  var currentUrl = this.secretUrl;
  if (currentUrl === undefined|| _.isEmpty(currentUrl)) {
    this.secretUrl = uuid.v4();
  }
  next();
});

schema.plugin(timestamps);
schema.plugin(indexes);

/* custom indexes */

/* methods */

schema.methods.getProgramById = function(programId) {
  if(this.programs) {
    return _.find(this.programs, function(p) {
      return p._id.toString() === programId;
    });
  }
};

schema.methods.getProgramCredentialId = function(programId) {
  var p = this.getProgramById(programId);
  if(!p || !p.credentialId) return;
  return p.credentialId;
};

/* statics */

schema.statics.findByOrgId = function(orgId, cb) {
  return Channel.find({ organizationId: orgId }, cb);
};

schema.statics.findBySecretUrl = function (secretUrl, cb) {
  return Channel.findOne({ secretUrl: secretUrl }, cb);
};

schema.statics.findProgramById = function(programId) {
  var deferred = q.defer();
  Channel
    .findOne({ 'programs._id' : programId }, 'programs')
    .exec(function(err, doc) {
      if (err) {
         deferred.reject(err);
       } else {
        var program = _(doc.programs).find(function(p) { return p._id.toString() === programId; });
        deferred.resolve(program);
      }
    });
  return deferred.promise;
};

/* indexing mode */

if(config.get('mongo-auto-index') === true) {
  schema.set('autoIndex', true);
}

/* model definition */

var Channel = mongoose.model('Channel', schema);

/* exports */

module.exports = Channel;
