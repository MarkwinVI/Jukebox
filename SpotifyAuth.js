/*
------
https://developer.spotify.com/web-api/authorization-guide/
------
*/

"use strict";

const sAuth = {};

//Grants user auth and gets the web token for the APIs

sAuth.handleSpotifyConnect = function(){

	return new Promise(function(resolve, reject){

  var myid = chrome.runtime.id;

	var SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize',

		CLIENT_ID = '33bbb46e3d9c4f5285facfd7fd23f6ca',

	    // REDIRECT_URI = 'https://anfgdiphknnnkpljbnmjcfiamgljjllj.chromiumapp.org/popup.html',

      REDIRECT_URI = 'https://' + myid + '.chromiumapp.org/popup.html',

	    SPOTIFY_RESPONSE_TYPE = 'token';
      /*The spotify API says that you need to use playlist-modify-private/public, but that doesnt work 
      So appearantly you had to use the playlist-modify scope
      */
    var SPOTIFY_SCOPE = 'playlist-modify';


	var authURL = 
		SPOTIFY_AUTH_URL + "?client_id=" + 
		CLIENT_ID + "&redirect_uri=" + 
		encodeURIComponent(REDIRECT_URI) + "" +
    "&scope=" + SPOTIFY_SCOPE + 
		"&response_type=" + SPOTIFY_RESPONSE_TYPE;
    
    

/*
Launches spotify's authorization sceen and gets the access_token for API authorization
Leave interactive to true, otherwise the login window wont show up
*/
    chrome.identity.launchWebAuthFlow({

        url : authURL,
   			interactive : true},

   			function(redirectURL){
   				/* 
   				Using regex extract the acces token from the response URL
   				*/
   				let redirect = redirectURL.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
   				/* 
   				Promise's response depending whether 'redirect' is null
   				*/
   				if (redirect){
       			resolve(redirect);
       			}else{
       			reject("Error");
       			}	
   				
   				
   			});
       
      
       });
     };

