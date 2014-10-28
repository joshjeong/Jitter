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


   if(tweetText.indexOf("") > -1){
      $('#tweet-river').prepend("<a href='#' class='img-circle col-md-2 pic'><img src=" + pic + "></a><span class='username col-md-6'>" + screenName +"</span>  "+"<span class='time col-md-6'>"+ date+"</span><div class = 'tweet col-md-11'>"+tweetText+"</div>")
    }
  })
 }

$(document).on('ready', init);





