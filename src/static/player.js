var Player = {
   // needs to be cleared when the song is not loaded anymore
   playing: false,
   paused: false,
   playing_id: -1,

   // the all powerful play function. call it and the song at the top of the queue
   // will start playing. displays a loader while the song can't be played, playing
   // when streaming is ready.
   // return true on success, false otherwise
   play: function() {
      if (songQueue.length < 1)
         return false;

      if (this.playing_id == songQueue[0].id) {
         // in order for the stored playing id to match the top, play must
         // have been called, and so we're just continuing a song where it left
         // off
         if (this.paused)
            return songQueue[0].play();
         else
            return false;
      } else {
         // new song: make sure to stop everything, then set new progress bars,
         // destroying previous ones. load up if necessary and play
         this.stop();
         Player.setProgressBar(songQueue[0].id, songQueue[0].info.duration);
         var currTop = $('#' + songQueue[0].id);
         currTop.addClass('loading');
         if (songQueue[0].play == undefined)
            songQueue[0].load();
         currTop.removeClass('loading');
         this.playing_id = songQueue[0].id;
         return songQueue[0].play();
      }
   },

   // pauses the song, revealing draggable song and hiding the 'now playing div'
   // note: now playing div is not removed entirely
   pause: function() {
      for (var i = 0; i < songQueue.length; i++)
         if (songQueue[i].pause != undefined)
            songQueue[i].pause();
      this.paused = true;
      this.playing = false;
   },

   // stops the song, destroying all progress bars and pausing all songs to ensure
   // no sound is being played
   stop: function() {
      var top = songQueue[getTrackPosition(this.playing_id)];
      if (top && top.stop)
         top.stop();
      this.pause();
      this.destroyProgressBars();
      this.playing = false;
      this.paused = false;
   },

   progress: function() {
      if (this.playing_id && this.playing_id != songQueue[0].id) {
         songQueue[0].load();
         removeSong(getTrackPosition(this.playing_id), "played");
      } else {
         removeSong(0, "played");
         songQueue[0].load();
      }
      // if unsuccessful playing, try again after 5 seconds
      // if again unsuccessful again, pause and call it good.
      if (!Player.play()) {
         setTimeout(function() {
            if (!Player.play())
               Player.pause();
         }, 1000);
      }
   },

   // sets up a progress bar with for song with given 'track_id' and 'duration',
   // setting interval for progress duration update
   setProgressBar: function(track_id, duration) {
      var playing = $('#' + track_id);
      playing.append('<div id="' + track_id + '_pbar" class="progressbar"></div>')
      var pixelWidth = playing.outerWidth();
      var intrvl;
      var progBar = $('#' + track_id + '_pbar');

      this.progressInterval = setInterval(
         getIntervalCallback(progBar, duration, pixelWidth, songQueue[0]),
         duration / pixelWidth);
   },

   destroyProgressBars: function() {
      clearInterval(this.progressInterval);
      var pbars = $('.progressbar');
      for (var i = 0; i < pbars.length; i++)
         pbars[i].remove();
   },

   // attaches all the player functions to the given songQueue 'entry' object.
   // added fields: load, play, pause, setPos, getPos
   attachPlayerLoader: function(entry) {
      var service = entry.info.service
      var player;
      if (service == 'soundcloud')
         player = sc_callbacks;
      else if (service == 'youtube')
         player = yt_callbacks;
      else
         console.log("unrecognized music service: " + queryResult.service);
      var id = (service == 'soundcloud') ? entry.info.sc_id : null; 
      entry.load = player.loadsong_cb(id, player, entry);
   }
}

function getIntervalCallback(progBar, duration, pixelWidth, track) {
   return function() {
      if (songQueue[0].getPos != undefined)
         progBar.width(track.getPos() / duration * pixelWidth);
   }
}

// namespaces of the form <service>_player are here defined with functions for
// retrieving callbacks for player utilities (play, pause, etc.) 
var sc_callbacks = {
   // returns a function that plays the given sound
   play_cb: function(sound) {
      return function() {
         if (sound.playState != 1 || sound.paused) {
            sound.play({
               onfinish: Player.progress
            });
            return true;
         }
      }
   },

   // returns a function that pauses the given sound
   pause_cb: function(sound) {
      return function() {
         sound.pause();
      }
   },

   // returns a function that stops and unloads the given sound
   stop_cb: function(sound) {
      return function() {
         sound.stop();
         sound.unload();
      }
   },

   // returns a function that seeks the given sound to song position 'pos'
   // position is given in milliseconds
   setPos_cb: function(sound) {
      return function(pos) {
         sound.setPosition(pos);
      }
   },

   // returns a function that seeks the given sound to song position 'pos'
   getPos_cb: function(sound) {
      return function() {
         return sound.position;
      }
   },

   // returns a function that return true if the given song is playing or buffering,
   // false otherwise
   getIsPlaying_cd: function(sound) {
      return function() {
         return sound.playState == 1;
      }
   },

   // returns a function that loads up the track and returns the loaded sound
   // after the returned function is called, 'entry' will have all necessary
   // callbacks for operation (play, pause, etc.)
   loadsong_cb: function(track_id, player_type, entry) {
      return function() {
         // all callbacks set to a function that immediately return false until
         // the stream loads and sets them to functions that do the appropriate
         // things
         entry.play = entry.pause = entry.stop = entry.setPos
                  = entry.getPos = function() { return false; };
         var sound = SC.stream("/tracks/" + track_id, function(sound) {
            entry.play = player_type.play_cb(sound);
            entry.pause = player_type.pause_cb(sound);
            entry.stop = player_type.stop_cb(sound);
            entry.setPos = player_type.setPos_cb(sound);
            entry.getPos = player_type.getPos_cb(sound);
            entry.isPlaying = player_type.getIsPlaying_cd(sound);
            sc_callbacks.stream_loading = false;
         });
         return sound;
      }
   }
}

var yt_callbacks = {
   // returns a function that plays the given sound
   play_cb: function(url) {
      return function() {

         var ours = extractYTVideoID(songQueue[0].info.stream_url);
         var yts = extractYTVideoID(yt_callbacks.player.getVideoUrl());
         if (ours != yts) {
            yt_callbacks.player.loadVideoByUrl({
               'mediaContentUrl': url,
               'suggestedQuality': 'small'
            });
         }
         try {
            yt_callbacks.player.playVideo();
            return true;
         } catch (err) {
            console.log("there was some failure playing a youtube video");
            return false;
         }
      }
   },

   // returns a function that pauses the given sound
   pause_cb: function() {
      return function() {
         yt_callbacks.player.pauseVideo();
      }
   },

   // returns a function that stops and unloads the given sound
   stop_cb: function() {
      return function() {
         yt_callbacks.player.stopVideo();
      }
   },

   // returns a function that seeks the given sound to song position 'pos'
   // position is given in milliseconds
   setPos_cb: function() {
      return function(pos) {
         yt_callbacks.player.seekTo(pos / 1000, true);
      }
   },

   // returns a function that seeks the given sound to song position 'pos'
   getPos_cb: function() {
      return function() {
         return yt_callbacks.player.getCurrentTime() * 1000;
      }
   },

   // returns a function that return true if the given song is playing or buffering,
   // false otherwise
   getIsPlaying_cd: function() {
      return function() {
         return yt_callbacks.player.getPlayerState() == 1 ||
         yt_callbacks.player.getPlayerState() == 3;
      }
   },

   // returns a function that loads up the track and returns the loaded sound
   // after the returned function is called, 'entry' will have all necessary
   // callbacks for operation (play, pause, etc.)
   loadsong_cb: function(track_id, player_type, entry) {
      return function() {
         entry.play = player_type.play_cb(entry.info.stream_url);
         entry.pause = player_type.pause_cb();
         entry.stop = player_type.stop_cb();
         entry.setPos = player_type.setPos_cb();
         entry.getPos = player_type.getPos_cb();
         entry.isPlaying = player_type.getIsPlaying_cd();
         yt_callbacks.player.addEventListener("onStateChange",
            function(event) {
               if (event.data == 0)
                  Player.progress();
            }
         );
      }
   }
}

// returns the video id for a youtube video from a url, undefined if it find the id
function extractYTVideoID(url) {
   var start;
   var end;
   if (url.indexOf("v=") != -1) {
      start = url.indexOf("v=") + 2;
      end = url.indexOf("&");
   } else if (url.indexOf("/v/") != -1) {
      start = url.indexOf("/v/") + 3;
      end = url.indexOf("?");
   } else {
      return undefined;
   }
   if (end == -1)
      end = url.length;
   return url.substring(start, end);
}





