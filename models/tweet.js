var express = require("express")
  , app = express()
  , mongoose = require('mongoose');

var tweetSchema = new mongoose.Schema({
    tweetId    : Number
  , screenName : String
  , date       : Date
  , pic        : String
  , tweetText  : String
  , loc        : Object
});
  
module.exports = mongoose.model('Tweet', tweetSchema);