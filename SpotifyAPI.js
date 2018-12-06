"use strict";

const spapp = {};

/*
song_uri_array will hold all the uri(spotify identificators for a song)

*/

var song_uri_array = [];
var son_arr = [];

/* ---
The sleep fucntion pauses the program for a given amount of ms
-----*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
The sapp.getSong() is called from the StringExtr.js and contains the stripped down song string array(processed_array), access_token for
Spotify OAuth, as well as the artist string array.

The function loops through the number of songs it has in the 'processed_arrray' (currently the max is 50 songs, due to Google API limitations), and calls
an ajax GET method for each iteration, finding the song by its name in the spotify database.

Then it compares the given artist of the first result to the corresponding string in the artist_array. If its a match, the song name and its uri(identification thingy)
is pushed to two different arrays and then dealt with accordingly. If there is no match the song is skipped.
*/

spapp.getSong = async function(processed_array, access_token, artist_array, raw_song_array) {


  var processed_array_length = processed_array.length;
  var privatevideos = 0;
  var control_int = 0;
  var not_found_count = 0;
  //Songs for which artists didnt match
  var badly_mathced_songs = 0;


  for (let iteration = 0; iteration < processed_array_length; iteration++) {
    /*---
    If it has been the 90th call (around the rate limit for the search API), wait a while
    this case 1min and continue, wait for every 90th call,
    bad way to do this, probably should lower the waiting time, but should work for now
    TODO: try to improve this
    --*/

    if (iteration != 0 && iteration % 90 == 0) {
      console.log("waiting...");
      document.getElementById("log").innerHTML = "Searching the Spotify Database...";
      await sleep(15000);
    }

    if (processed_array[iteration] == "Deleted video" || processed_array[iteration] == "Private video") {
      privatevideos++;
      iteration++;
      control_int++;
    }
    $.ajax({

      type: 'GET',
      url: 'https://api.spotify.com/v1/search',
      data: {
        type: 'track',
        q: processed_array[iteration]
      },
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(data) {

        /* WORKS BUT VERY CLUMSY */
        /* URI is the song identifier so later it can be added to a playlist*/
        /* TODO:
        I cut up artist names if they are something like "chainsmokers & coldplay" to just chainsmokers cuz spotify lists them as
        two sepparate artists and that makes sense, but for some reason spotify chooses to list ayo & theo as a full name
        instead of cutting them up

        ADDITIONAL TODO: FIGURE OUT WHY andra - why isnt being found in the search
        */
        console.log(data);
        let artist = artist_array[iteration];
        let found = false;

        var comma = artist.indexOf(',');
        var and = artist.indexOf('&');
        var ft = artist.indexOf(' ft ');

        artist = artist.substring(0, comma != -1 ? comma : artist.length);
        artist = artist.substring(0, and != -1 ? and : artist.length);
        artist = artist.substring(0, ft != -1 ? ft : artist.length);
        artist = artist.trim();

        // Add an int to check when how many data.tracks.items the $each loop will go through
        var index = 0;
        if ((data.tracks.items).length == 0) {
          console.log("No song found");
          console.log(processed_array[iteration]);
          control_int++;
        }

        /** Check if artist from spotify API for the given track
        /* matches the artist from artist_array
         */
        $.each(data.tracks.items, function(i, item) {

          $.each(item.artists, function(o, artisto) {

            if (artisto.name.toLowerCase() == artist.toLowerCase()) {

              found = true;
              song_uri_array.push(item.uri);

              son_arr.push(item.name);
              control_int++;

              return false;


            }
          });

          if (found) {
            //resets the bool
            found = false;
            return false;
          };
          /* chekcs the lenght of data.tracks.items, if its the last element, and no mathcing artist
          has been found, add the closest (first) song name match (if possible)
          Ideally this should be obsolete and undeccessary

          IDEA: mark the songs that havent matched with an artist in a different way, and ask the user
          to confirm*/

          if (index == ($(data.tracks.items).length - 1)) {

            if ((data.tracks.items[0].name.toLowerCase()).indexOf(processed_array[iteration].trim().toLowerCase()) !== -1) {
              //console.log("arstist not found - pushing first found element");
              son_arr.push(data.tracks.items[0].name);
              song_uri_array.push(data.tracks.items[0].uri);
              control_int++;
              badly_mathced_songs++;
            } else {

              document.getElementById("log").innerHTML = "Failed to find the following songs";

              var node = document.createElement("LI");
              var textnode = document.createTextNode(raw_song_array[iteration]);
              node.appendChild(textnode);
              document.getElementById("failed_list").appendChild(node);

              console.log("Failed to extract the song name of :\n");
              console.log("=> " + processed_array[iteration]);

              control_int++;
              not_found_count++;
            }


          }
          index++;


        }); // End of $.each



      },
      error: function(err) {
        console.log(err + "|" + processed_array[iteration]);




      }
    }); //END OF AJAX
  } //END OF FOR LOOP

  /* Waits for all the async functions to finish*/
  var checkArr = setInterval(function() {

    if (control_int == processed_array_length) {
      console.log(son_arr);
      console.log(control_int);
      clearInterval(checkArr);
      //spapp.createPlaylist(access_token);
      console.log("Private or Deleted videos: " + privatevideos);
      let found_percentage = 1 - (not_found_count / processed_array_length);
      console.log("Found song ratio: " + found_percentage);
      console.log("Unsure if right songs(no artist match)" + badly_mathced_songs);
    }
  }, 100);

  /* Stops the loading animation*/
  document.getElementById("NameCreation").style.display = 'block';
  document.getElementById("Loading_Title").innerHTML = "Completed..";
  document.getElementById("spinner_animation").style.display = 'none';
  $('#NameCreation').on('submit', function(e) {

    e.preventDefault();

    var playlist_name = $('input[name = playlist_name]').val();
    spapp.createPlaylist(access_token,playlist_name);

  });
};





spapp.createPlaylist = function(access_token,playlist_name) {

  var promise = spapp.getUserId(access_token);

  promise.then(function(user_ID) {
    var POST_URL = "https://api.spotify.com/v1/users/" + user_ID + "/playlists";

    $.ajax({
      type: "POST",
      url: POST_URL,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      /* The JSON.stringify() is used because the POST method requires the call to be
      a json string
      Appearantly I only had to do this for the data section and not the header section
      */
      data: JSON.stringify({
        name: playlist_name
      }),
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      success: function(data) {

        console.log("CREATED PLAYLIST\n ADDING TRACKS");
        let playlists_id = data.id;
        spapp.addTracks(playlists_id, user_ID, access_token);


      },
      error: function(err) {

        console.log(err);

      }
    }); //END of AJAX

  }); //END of promise.then


};

spapp.getUserId = function(access_token) {

  /* Just like wiht Oauth since Ajax is asynchronous it executes the
  next piece of code before data is returned from the GET request
  So promise had to be used
  */
  return new Promise(function(resolve, reject) {

    $.ajax({

      type: 'GET',
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(data) {

        if (data.id) {
          resolve(data.id);
        } else {
          reject("Error");
        }

      } //End of success: function

    }); //End of Ajax

  }); // End of Promise return

};


spapp.addTracks = function(playlist_id, user_id, access_token) {

  /* createGroupArray() dvides the massive array into smaller arrays each having 80 elements,
  If i were to call the uri through a request body I could do 100 uris per loop and thus
  making the programm faster but I cant figure out how to add more than 2 uri programmatically through
  the request body, so i went with the query string
  */

  var createGroupedArray = function(arr, chunkSize) {
    var groups = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  };


  var groupedArr = createGroupedArray(song_uri_array, 80);
  var chunked_array = JSON.stringify(groupedArr);


  var successfull_post = 0;

  for (let i = 0; i < groupedArr.length; i += 1) {

    var uri_ = groupedArr[i].join();

    $.ajax({
      type: "POST",

      url: "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/tracks?uris=" + uri_,
      headers: {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json"
      },
      success: function() {
        successfull_post++;
      },
      error: function(err) {
        console.log(err);
      }

    }); //END OF AJAX

  } //END OF FOR LOOP
// document.getElementById("spinner_animation").style.display = 'block';
  var user_id = spapp.getUserId(access_token);
  user_id.then(function(USER_ID){
      var resolve_link = "https://open.spotify.com/user/" + USER_ID;
      window.open(resolve_link,"_self");
  });
 



};
