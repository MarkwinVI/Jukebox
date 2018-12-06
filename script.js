const app = {};

//Gets the values from the input box in the popup window

var playlistActive = false;
var urlActive = false;
app.events = function() {
  $('#main').on('submit', function(e) {
    e.preventDefault();


    var playlist = $('input[name = playlist]').val();
    var playlist_name = $('input[name = playlist_name]').val();

    let url = $('input[name = url]').val();

    if (playlist != "") {
      /* stores the playlist value to local storage so that the
      proceesing page(loading.html) would be able to acces it*/
      playlistActive = true;
      localStorage.setItem("playliststatus", playlistActive);
      localStorage.setItem("playlistName", playlist);

      
      window.open("loading.html", "Jukebox");


    } else if (url != "") {
      urlActive = true;
      localStorage.setItem("urlstatus", urlActive);
      localStorage.setItem("UrlName", url);
      window.open("loading.html", "Jukebox");

    } else {
      console.log("ERROR, YOu cant have both");
    }



  });
};

app.runPlaylist = function(playlist) {

  /* gets the playlist ID from the URl, everything that follows after 'list=' */
  playlist = playlist.split("list=")[1];
  listapp.managePlaylistRequest(playlist);

}
app.runURL = function(url) {

  url = url.split("v=")[1];

  listapp.getURLRequest(url);



}


//Initializing function
app.init = function() {
  app.events();
};


$(app.init);



var windowLoc = $(location).attr('pathname');

if (windowLoc.includes("/loading.html")) {
  document.getElementById("log").innerHTML = "Fetching Song Titles...";

  /*
    if (localStorage.getItem('urlstatus')) {
      app.runURL(localStorage.getItem('UrlName'))

    }*/

  if (localStorage.getItem('playliststatus')) {
    app.runPlaylist(localStorage.getItem('playlistName'));
  }

}



$(function() {
  $('input').on('change', function() {
    var input = $(this);
    if (input.val().length) {
      input.addClass('populated');
    } else {
      input.removeClass('populated');
    }
  });

  setTimeout(function() {
    $('#fname').trigger('focus');
  }, 500);
});
