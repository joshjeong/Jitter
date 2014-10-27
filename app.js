var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , bodyParser = require("body-parser")
  , io = require("socket.io").listen(http)
  , _ = require("underscore")
  , dotenv = require('dotenv')
  , Twit = require('twit')
  , util = require('util')
  , mongoose = require('mongoose');

dotenv.load();
mongoose.connect('mongodb://55.55.55.5/test')

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY
  , consumer_secret: process.env.CONSUMER_SECRET
  , access_token: process.env.ACCESS_TOKEN
  , access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){
});

var tweetSchema = mongoose.Schema({
                screenName: String 
                // date: String, 
                // pic: String, 
                // tweet: String
});

var Tweet = mongoose.model('tweets', {screenName: String});


var test = new Tweet({
                screenName: "josh"
              // , date: "March 1"
              // , pic: "www.something.com"
              // , tweet: "hello world!"
})


app.get('/tweets', function(req, res){
  mongoose.model('tweets').find(function(err, tweets){
    res.send(tweets)
  })
})


/* Server config */

//Server's IP address
app.set("ipaddr", "127.0.0.1");

//Server's port number 
app.set("port", 8080);

//Specify the views folder
app.set("views", __dirname + "/views");

//View engine is Jade
app.set("view engine", "jade");

//Specify where the static content is
app.use(express.static("public", __dirname + "/public"));

//Tells server to support JSON requests
app.use(bodyParser.json());

/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get("/", function(request, response) {

  //Render the view called "index"
  // var filterOptions = ['Front End', 'Back']
  response.render("index");

});


io.on("connection", function(socket){

  var stream = T.stream('statuses/filter', { track: 'food' })

  stream.on('tweet', function (data) {
    io.sockets.emit('newTweet', {tweet: data})
  })
})

// Start server
http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


