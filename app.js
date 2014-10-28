var httpAdapter = 'http'
  , geocoderProvider = 'google';

var express = require("express")
  , app = express()
  , http = require("http").createServer(app)
  , bodyParser = require("body-parser")
  , io = require("socket.io").listen(http)
  , _ = require("underscore")
  , dotenv = require('dotenv')
  , Twit = require('twit')
  , util = require('util')
  , geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra)
  , mongoose = require('mongoose');

dotenv.load();

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY
  , consumer_secret: process.env.CONSUMER_SECRET
  , access_token: process.env.ACCESS_TOKEN
  , access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var extra = {
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null
}

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

app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static("public", __dirname + "/public"));
app.use(bodyParser.json());

app.get("/", function(request, response) {
  response.render("index");
});

io.on("connection", function(socket){
  // var filter = ['webdeveloper', 'web developer', 'webdev']
  var filter = ['food']
    , stream = T.stream('statuses/filter', { track: filter } )

  stream.on('tweet', function (data) {

    var tweetText = data.text
      , screenName = data.user.screen_name
      , date = data.created_at
      , pic = data.user.profile_image_url
      , hasCoord = data.coordinates
      , parameters = {
           screenName  : screenName,
           date        : date,
           pic         : pic,
           tweetText   : tweetText
      }

      if(hasCoord!=null){
        coord = data.coordinates.coordinates
        longitude = coord[0]
        latitude = coord[1]
        geocoder.reverse(latitude, longitude, function(err, res) {
          console.log(res)
        })
        io.sockets.emit('newTweet', {tweet: parameters})
      }
      else{
        io.sockets.emit('newTweet', {tweet: parameters})
      }

    // var streamTweet = new Tweet(parameters);
    // streamTweet.save(function (err) {
    //   if (err)
    //   console.log('bark');
    // });
  })
})

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


