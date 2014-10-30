var express = require('express')
  , app = express();

module.exports = function(app){
  app.get("/", function(request, response) {
    response.render("index");
  });
}