var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
    tweetId    : Number
  , screenName : String
  , date       : Date
  , pic        : String
  , tweetText  : String
});

module.exports = mongoose.model('Tweet', tweetSchema);