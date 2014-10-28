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

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY
  , consumer_secret: process.env.CONSUMER_SECRET
  , access_token: process.env.ACCESS_TOKEN
  , access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var db = mongoose.connection;

var tweetSchema = mongoose.Schema({
    screenName : String
  , date       : Date
  , pic        : String
  , tweetText  : String
});

var Tweet = mongoose.model('Tweet', tweetSchema);


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){
  
});

mongoose.connect('mongodb://localhost/test')

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
  response.render("index");

});


io.on("connection", function(socket){
  var filter = ['webdeveloper', 'web developer', 'webdev']
    , stream = T.stream('statuses/filter', { track: filter } )

  stream.on('tweet', function (data) {
    var tweetText = data.text
      , screenName = data.user.screen_name
      , date = data.created_at
      , pic = data.user.profile_image_url
      , parameters = {
           screenName  : screenName,
           date        : date,
           pic         : pic,
           tweetText   : tweetText
      }

    var streamTweet = new Tweet(parameters);
    streamTweet.save(function (err) {
      if (err)
      console.log('bark');
    });
    io.sockets.emit('newTweet', {tweet: parameters})
  })
})

// Start server
http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


