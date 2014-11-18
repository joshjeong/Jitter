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
states = require('./models/states.js');

var db = mongoose.connection;
var TweetModel = require('./models/tweet')


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){ 
  TweetModel.tweetSchema;
});

mongoose.connect('mongodb://localhost/tweetdatabase')

app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.static("public", __dirname + "/public"));
app.use(bodyParser.json());


app.get("/filter", function(req, res){

  var TweetRetriever = function(filterName, filterLocation){
    this.filterName = filterName
    this.filterLocation = filterLocation
    this.allTweets = []
  }
  
  TweetRetriever.prototype = {
    
    retrieveTweets: function(){
      var self = this

      mongoose.model('TweetModel').find(function(err,tweets){
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
          , words = tweet.tweetText.toUpperCase().replace(/[^\w\s]/gi, '').split(' ')
        if(words.indexOf(this.filterName)!=-1){
          filteredTweets.push(tweet) 
        }
      }
      return filteredTweets
    }, 

    filterByLocation: function(tweets){
      var self = this
        , filteredTweets = []
      if(this.filterLocation=="All"){
        return tweets
      }
      else{
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
  }

  var t = new TweetRetriever(req.query.filterName.toUpperCase(), req.query.filterLocation);
  t.retrieveTweets();
})

io.on("connection", function(socket){
  var filter = ['hiring', 'webdeveloper', 'web developer', 'webdev', 'recruiting']
    , stream = T.stream('statuses/filter', { track: filter } )

  stream.on('tweet', function (data) {
    var Tweet = function(data){
      this.tweetText = data.text;
      this.tweetId = data.id;
      this.screenName = data.user.screen_name;
      this.date = data.created_at;
      this.pic = data.user.profile_image_url;
      this.hasCoord = data.coordinates;
      this.userLocation = data.user.location;
      this.parameters = {
            tweetId     : this.tweetId,
            screenName  : this.screenName,
            date        : this.date,
            pic         : this.pic,
            tweetText   : this.tweetText
      }
    };

    Tweet.prototype = {
      save: function(parameters){
        var streamTweet = new TweetModel(parameters);

        TweetModel.find({ tweetId: parameters.tweetId }, function(err, tweet){
          console.log('find')
          if (err) return handleError(err);
          if (tweet.length == 0){
            streamTweet.save(function (error) {
              console.log('saved')
            if (error)
              console.log('bark');
            });
          }
        })
      }
    };


    var t = new Tweet(data)
      // If tweet does not have coordinates,
      // Iterate through tweet text for state initials
      if(t.hasCoord==null){
        var words = t.tweetText.replace(/[^\w\s]/gi, '').split(' ')
        for(var i in words){
          if(states[words[i].toUpperCase()]!= undefined){
            t.parameters.loc ={
              country: "United States",
              state: states[words[i].toUpperCase()]
            }
            t.save(t.parameters);
          }
        }
      }

      // If tweet has coordinates
      if(t.hasCoord!=null){
        var coord = data.coordinates.coordinates
          , longitude = coord.shift()
          , latitude = coord.shift();

        geocoder.reverse(latitude, longitude, function(err, res) {
          // if(res.shift()){
            var locInfo = res.shift()

            t.parameters.loc = {
              country : locInfo.country,
              city    : locInfo.city,
              state   : locInfo.state
            };
            console.log('Location found')
            t.save(t.parameters);
          // }
        })
      }

      // io.sockets.emit('newTweet', {tweet: t.parameters})


  })
})

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


