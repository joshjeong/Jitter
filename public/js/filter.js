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
    }).done(function(response){
      console.log('received data from server')
    })
  }
}