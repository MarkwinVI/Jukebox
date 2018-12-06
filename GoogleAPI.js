"use strict";

const listapp = {};

/* This function has the PlaylistID variable passed to it from the script.js file
 and using the Youtube Data API V3 (https://developers.google.com/youtube/v3/docs/playlistItems/list)
it retuns each video title in the playlist
*/


var raw_song_array = [];
var totalResults;


listapp.getPlaylistRequest = function(PlaylistID) {

  var nextPageToken;

  return new Promise(function(resolve, reject) {

    function hey(PlaylistID, nextPageToken) {


      let ajaxCall = $.ajax({

        type: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',

        datatype: 'json',
        data: {
          part: "snippet",
          maxResults: 50,
          playlistId: PlaylistID,
          pageToken: nextPageToken,
          key: 'AIzaSyBrUDsx0KvJfxhej0wjiVBkyDUfG-CmZ8g'
        }


      });

      // resets the nextpagetoke, for the if statement to come.
      nextPageToken = "";

      /*
      When the GET method has retrieved all the data, it executes the following
      code.
      */

      ajaxCall.done(function(data) {
        var pageToken = data.nextPageToken;
        totalResults = data.pageInfo.totalResults;


        $.each(data.items, function(i, item) {
          let song_title = item.snippet.title;
          raw_song_array.push(song_title);

        });




        /* If a playlist has more than 50 results, the rest are displayed in a different page,
        so you have to get the token of that and call another AJAX request for the next 50
        results, until pagetoken returns false.

        */

        if (pageToken) {
          hey(PlaylistID, pageToken);

        };

      }); //End of AJAX.done()

      ajaxCall.fail(function() {

      });

    }; //END of hey

    hey(PlaylistID, nextPageToken);

    if (raw_song_array) {
      resolve(raw_song_array);
    } else {
      reject("Error");
    };

  }); //END of promise

};

/*----
The function calls the Spotify Oath process and gets a promise for the access_token,
it also gets a promise for the song array form the getPlaylistRequest function
then it checks when the array length equals the given amount of song titles (goten from
ajax) and proceedes to process the array if it does equal, if it doesnt, then it sets
an 300ms interval and checks again
----*/



listapp.managePlaylistRequest = function(PlaylistID) {
  /* A very hacky way of doing things, needs a more elegant solution*/
  //calls the The Spotify OAuth process

  var promise_array = listapp.getPlaylistRequest(PlaylistID);
  var promise = sAuth.handleSpotifyConnect();

  promise_array.then(function(array) {

    var checkArray = setInterval(function() {
      if (array.length == totalResults) {
        console.log(array);
        clearInterval(checkArray);
        outputApp.titleProcess(array, promise);
      }
    }, 300);




  });

};

/* Fucntion takes the link of a single song compilation Youtube video and if its there - gets the tracklist from the
description. Using the Videos --- List Youtube Data API V3

https://developers.google.com/youtube/v3/docs/videos/list

*/
listapp.getURLRequest = function(urlID) {

  let ajaxCall = $.ajax({

    type: 'GET',
    url: 'https://www.googleapis.com/youtube/v3/videos',
    datatype: 'json',
    data: {
      part: 'snippet,contentDetails,statistics',
      id: urlID,
      key: 'AIzaSyBrUDsx0KvJfxhej0wjiVBkyDUfG-CmZ8g'
    }
  });
  ajaxCall.done(function(data) {


    /* Splits the returned description by new line,
    goes through each line and checks if it contains '-'
    then assumes that that line contains the song name and
    passes to string extraction
    */

    console.log(data);
    var returned_description = data.items[0].snippet.description.split("\n");
    for (let i = 0; i < returned_description.length; i++) {
      /* checks if line contains song */
      if (returned_description[i].indexOf("-") > -1) {
        /* checks if song line also contains things like
         0:00:00 - 00:03:16 artistt - song name
         */
        /*
        if ((returned_description[i].split("-").length - 1) > 1) {

          var index = /[a-z]/i.exec(returned_description[i]).index;
          raw_song_array.push(returned_description[i].substring(index));

          continue;
        }
        raw_song_array.push(returned_description[i]);*/
        var index = /[a-z]/i.exec(returned_description[i]).index;
        raw_song_array.push(returned_description[i].substring(index));
      }

    }
    if (raw_song_array.length > 0) {

      console.log(raw_song_array);
      var promise = sAuth.handleSpotifyConnect();
      outputApp.titleProcess(raw_song_array, promise);
    }

  });

};
