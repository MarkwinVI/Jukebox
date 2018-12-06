/* -----------------------------
THIS IS JUST AN ALPHA VERSION OF HOW TO EXTRACT SONG NAMES FROM THE
GIVEN STRINGS. IT'S SIMPLE AND EASY TO BREAK
IN NEED OF REPLACEMENT ASAP
--------------------------------*/

const outputApp = {};
/*
Processes the input from the video description and tries
to extract song names from the given list(if provided)
*/

/* Processes the input from the title retrival*/

outputApp.titleProcess = function(raw_song_array, promise) {

  /*The common trend is that all the titles are structred like this:
	Artist - SONG NAME + other info, since the spotify API can only get the song if just the
	song name is provided, without all the additional "ft. ....", "(Official video)", etc.

 	So im splitting the string in two and stripping it.

  This whole string extraction is horrendous but whilst im lookign for a better way
  this will have to  work
 	*/


  var array_length = raw_song_array.length;
  var processed_array = [];
  var processed_artist_array = [];


  document.getElementById("log").innerHTML = "Extracting Entities...";

  var song, artist;

  for (let iteration = 0; iteration < array_length; iteration++) {

    /* If/else checks if the artist for the song is given in the format of 'artist - song...' */
    if (raw_song_array[iteration].indexOf("-") > -1) {

      let song_title_array = raw_song_array[iteration].split("-");
      artist = song_title_array[0].trim();
      song = song_title_array[1];

    } else if (raw_song_array[iteration].indexOf(":") > -1) {

      let song_title_array = raw_song_array[iteration].split(":");
      artist = song_title_array[0].trim();
      song = song_title_array[1];

    } else if (raw_song_array[iteration].indexOf("–") > -1) {

      let song_title_array = raw_song_array[iteration].split("–");
      artist = song_title_array[0].trim();
      song = song_title_array[1];

    } else {
      song = raw_song_array[iteration];
    }


    try {

      var bracket = song.indexOf('[');
      var parenthese = song.indexOf('(');
      var feat = song.indexOf('feat');
      var ft = song.indexOf('ft ');
      var Ft = song.indexOf("Ft.");
      var ftp = song.indexOf("ft.");
      var col = song.indexOf('|');

      song = song.substring(0, bracket != -1 ? bracket : song.length);
      song = song.substring(0, parenthese != -1 ? parenthese : song.length);
      song = song.substring(0, feat != -1 ? feat : song.length);
      song = song.substring(0, ft != -1 ? ft : song.length);
      song = song.substring(0, col != -1 ? col : song.length);
      song = song.substring(0, ftp != -1 ? ftp : song.length);
      song = song.substring(0, Ft != -1 ? Ft : song.length);

      processed_array.push(song);
      processed_artist_array.push(artist);




    } catch (err) {

      console.log(err);

    }

  } //End of for loop

  /* token_return is the token returned after the OAuth with spotify*/
  promise.then(function(token_return) {
    console.log(processed_array);

    spapp.getSong(processed_array, token_return, processed_artist_array, raw_song_array);


  });

};
