function init() {

  var serverBaseUrl = document.domain
    , socket = io.connect(serverBaseUrl);



  socket.on('newTweet', function(data){
  $('#tweet-river').append("<h1>"+ data.tweet.text + "</h1><br>")
  })

}

$(document).on('ready', init);
