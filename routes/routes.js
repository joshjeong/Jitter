var express = require('express')
  , app = express()
  , states = require('../models/states')

module.exports = function(app){
  app.get("/", function(req, res) {
    res.render("index", {states: states});
  });
}