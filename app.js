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

require('./routes/routes')(app);

var db = mongoose.connection;
var Tweet = require('./models/tweet')


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){ 
  Tweet.tweetSchema;
});

mongoose.connect('mongodb://localhost/test')

app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static("public", __dirname + "/public"));
app.use(bodyParser.json());


app.get("/filter", function(req, res){

  var TweetRetriever = function(){
    this.filterName = req.query.filterName
    this.filterLocation = req.query.filterLocation
    this.allTweets = []
  }
  
  TweetRetriever.prototype = {
    
    retrieveTweets: function(){
      var self = this

      mongoose.model('Tweet').find(function(err,tweets){
        self.filterTweets(tweets)
      })
    },

    filterTweets: function(tweets){
      var firstFilter = this.filterByPosition(tweets)
        , secondFilter = this.filterByLocation(firstFilter)
      res.send(secondFilter)
    },

    filterByPosition: function(tweets){
      var self = this
        , filteredTweets = []
      for( i in tweets){
        var tweet = tweets[i]
          , words = tweet.tweetText.split(' ')
        if(words.indexOf(this.filterName)!=-1){
          filteredTweets.push(tweet) 
        }
      }
      return filteredTweets
    }, 

    filterByLocation: function(tweets){
      var self = this
        , filteredTweets = []
      for( i in tweets){
        var tweet = tweets[i]
          , location = tweet.loc.state
        if(location == this.filterLocation){
          filteredTweets.push(tweet) 
        }
      }
      return filteredTweets
    }
  }

  var t = new TweetRetriever;
  t.retrieveTweets();
})

io.on("connection", function(socket){
  // var filter = ['webdeveloper', 'web developer', 'webdev']
  // using "food" temporarily to generate more test tweets
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

          parameters.loc = {
            country : locInfo.country,
            city    : locInfo.city,
            state   : locInfo.state
          };
          
          var streamTweet = new Tweet(parameters);


          // Saves tweet if unique
          Tweet.find({ tweetId: parameters.tweetId }, function(err, tweet){
            if (err) return handleError(err);
            if (tweet.length == 0){
              streamTweet.save(function (error) {
              if (error)
                console.log('bark');
              });
            }
          })
        })
      }
      
      // io.sockets.emit('newTweet', {tweet: parameters})
      

      // What if tweet has no location?
      // else if(userLocation!=''){
      //   console.log(userLocation)
      // }

  })
})

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


