var express = require('express')
  , server = require('http').createServer( app )
  , io = require('socket.io').listen( server )
  , path = require('path')
  , app = express()
  , dotenv = require('dotenv')
  , Twit = require('twit');

    dotenv.load();


app.set( 'port', process.env.PORT || 3000 );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'jade' );
app.use( express.static(path.join(__dirname, 'public') ));


var errorHandler = function ( error, status ) {
  console.error.bind( console, error, status )
}

var tweetStream = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


/* sockets good, just commented out to see in terminal */

var stream = tweetStream.stream('statuses/sample')
// io.sockets.on('connection', function ( socket ) {
  stream.on('tweet', function( tweet, error ) {

  /* if error, remove error from stream and client */

      if ( error ) {
        errorHandler ( error )
      }

      console.log( tweet )

    // socket.emit('info', { tweet: tweet});
  // });
});


server.listen( app.get( 'port' ), function(){
  console.log( 'Job tracker successfully listening on port : ' + app.get( 'port' ) );
});