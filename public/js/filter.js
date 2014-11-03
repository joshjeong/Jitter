$(document).ready(function(){
  var fController = new Filter.Controller(Filter.View);
  fController.bindListeners();
});


Filter.Controller = function(view){
  this.view = new view;
}

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
    this.view.clearRiver();
    var filterName = button.siblings().first().val()
      , filterLocation = button.siblings().last().val()
    $.ajax({
      url: '/filter',
      type: 'GET',
      data: {filterName: filterName, filterLocation: filterLocation}
    }).done(function(tweetObjects){
      for(i in tweetObjects){
        var tweet      = tweetObjects[i]
          , tweetText  = tweet.tweetText
          , screenName = tweet.screenName
          , date       = tweet.date
          , pic        = tweet.pic
          , loc        = tweet.loc
          console.log(tweet.tweetId)
        $('#tweet-river').prepend("<a href='#' class='col-md-1 pic inline'><img class ='img-circle' src=" + pic + "></a><span class='username col-md-6 inline'>" + screenName +"</span>"+"<span class='time col-md-6 inline'>"+ date+"</span><div class = 'tweet col-md-11 inline-block'>"+tweetText+"</div>")
      }
    })
  }
}

Filter.View = function(){}

Filter.View.prototype = {
  clearRiver: function(){
    $('#tweet-river').children().remove()
  }
}