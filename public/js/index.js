function init() {

  var serverBaseUrl = document.domain
    , socket = io.connect(serverBaseUrl);

  // socket.on('connect', function () {
  
  // })
 
   socket.on('newTweet', function(data){

    var tweetText = data.tweet.tweetText
      , screenName = data.tweet.screenName
      , date = data.tweet.date
      , pic = data.tweet.pic
      , loc = data.tweet.loc


    if(tweetText.indexOf("") > -1){
      $('#tweet-river').prepend("<a href='#' class='col-md-4 pic'><img class ='img-circle img-responsive center-block inline-block' src=" + pic + "></a><div class='username col-md-8 inline-block'>" + screenName +"</div>"+"<div class='time col-md-8 inline-block'>"+ date+"</div><div class = 'tweet col-md-8 inline-block'>"+tweetText+"</div>")
    }
  })
 }

$(document).on('ready', init);