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
      , coord = data.tweet.coord


    if(tweetText.indexOf("") > -1){
      console.log(coord)
      $('#tweet-river').prepend("<a href='#' class='img-circle col-md-1 pic inline'><img src=" + pic + "></a><span class='username col-md-6 inline'>" + screenName +"</span>"+"<span class='time col-md-6 inline'>"+ date+"</span><div class = 'tweet col-md-11 inline-block'>"+tweetText+"</div>")
    }
  })
 }

$(document).on('ready', init);