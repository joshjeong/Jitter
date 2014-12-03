$(document).ready(function(){

})

River = {}

River.Controller = function(view){
  this.view = new view;
}

River.Controller.prototype = {
  bindListeners: function(){
    this.hoverContainerListener();
  },
  hoverContainerListener: function(){
    var self = this;
    $('#tweet-river').on('mouseenter', '.tweet-container', function(){
      self.view.showBorder($(this));
    });
    $('#tweet-river').on('mouseleave', '.tweet-container', function(){
      self.view.hideBorder($(this));
    });
  }
}

River.View = function(){}
River.View.prototype = {
  showBorder: function(tweetContainer){
    tweetContainer.addClass('shadow')
  },
  hideBorder: function(tweetContainer){
    tweetContainer.removeClass('shadow')
  }
}