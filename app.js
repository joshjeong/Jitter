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
  , fs = require('fs')
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

// fs.readdirSync(__dirname + '/models').forEach(function(filename){
//   if(~filename.indexOf('.js')){
//     var test = require(__dirname + '/models/' + filename)  
//     console.log(__dirname + '/models/' + filename)
//   } 
// })

var tweetModel = require('./models/tweet.js')


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

app.get("/filter", function(req, res){
  mongoose.model('Tweet').find(function(err,tweet){
    res.send(tweet)
  })
})


io.on("connection", function(socket){
  // var filter = ['webdeveloper', 'web developer', 'webdev']
  var filter = ['food']
    , stream = T.stream('statuses/filter', { track: filter } )

  stream.on('tweet', function (data) {

    var tweetText = data.text
      , tweetId = data.id
      , screenName = data.user.screen_name
      , date = data.created_at
      , pic = data.user.profile_image_url
      , hasCoord = data.coordinates
      , userLocation = data.user.location
      , parameters = {
           tweetId     : tweetId
         , screenName  : screenName
         , date        : date
         , pic         : pic
         , tweetText   : tweetText
      };

      if(hasCoord!=null){
        var coord = data.coordinates.coordinates
          , longitude = coord.shift()
          , latitude = coord.shift();

        geocoder.reverse(latitude, longitude, function(err, res) {
          var locInfo = res.shift()
            , streamTweet = new tweetModel(parameters);

          parameters.loc = {
            country : locInfo.country,
            city    : locInfo.city,
            state   : locInfo.state
          };
          
          // Tweet.findOne({ tweetId: tweetId }, function (err, doc) {
          //   if (err){
          //     console.log('error when saving')
          //   }
          //   console.log('this is doc')
          //   doc = parameters;
          //   console.log(doc)
          //   doc.save(function(){});
          // })


          streamTweet.save(function (err) {
          if (err)
            console.log('bark');
          });
          
          io.sockets.emit('newTweet', {tweet: parameters})
        })
      }
      // else if(userLocation!=''){
      //   console.log(userLocation)
      // }

  })
})

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


