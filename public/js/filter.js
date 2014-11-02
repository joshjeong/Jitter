$(document).ready(function(){
  var fController = new Filter.Controller;
  fController.bindListeners();
});


Filter.Controller = function(){}

Filter.Controller.prototype = {
  bindListeners: function(){
    this.filterBtnListener();
  },

  filterBtnListener: function(){
    var self = this;
    $('#filter-btn').on('click', function(){
      self.filterTweets($(this));
    })    
  },

  filterTweets: function(button){
    var filterName = button.siblings().val()
    $.ajax({
      url: '/filter',
      type: 'GET',
      data: {filterName: filterName}
    }).done(function(tweetObjects){
      for(i in tweetObjects){
        var tweet= tweetObjects[i]
          , tweetText = tweet.tweetText
          , screenName = tweet.screenName
          , date = tweet.date
          , pic = tweet.pic
          , loc = tweet.loc
       
        $('#tweet-river').prepend("<a href='#' class='col-md-1 pic inline'><img class ='img-circle' src=" + pic + "></a><span class='username col-md-6 inline'>" + screenName +"</span>"+"<span class='time col-md-6 inline'>"+ date+"</span><div class = 'tweet col-md-11 inline-block'>"+tweetText+"</div>")

      }
    })
  }
}