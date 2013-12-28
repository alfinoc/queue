// INVARIANT: song in position 0 is ready for play() to be called on it
var songQueue = [];
var graveyard = [];

// takes a dictionary of result and places a new
// div with the song chosen from the result onto the queue
// and updates the state of the queue
function addToQueueBottom(result) {
   // register with songQueue global
   var id = registerSong(result, songQueue.length);
   
   // create and display new song DOM element
   var newSong = makeNewSongElement(result, id);
   $('#songlist')[0].appendChild(newSong);
}

// morphs a jquery object 'newSong' containing an li into a 'song-info'
// note: this function's contents are very contingent on the class/styling
// conventions for result and song li's
function morphResultAndAdd(newSong, position) {
   // extract data
   var para = newSong.find('p');
   var title = para.html();
   var result = $(para.attr('result_id')).data("results");

   // register with songQueue global
   var id = registerSong(result, position);

   // set up new div in songqueue div
   newSong.removeClass("new-song");
   newSong.removeClass("resultwrap");
   newSong.addClass(result.service);
   newSong.html("<h1>" + title + "</h1>");
   newSong.addClass("songinfo");
   newSong.attr('id', id);
}

// adds the result object (of the type returned by the search service)
// 'queryResult' to the songQueue global in given 'position', returning
// the new song id associate with that song
// POST: song in position 0 is ready for play() to be called on it
function registerSong(queryResult, position) {
   var id = getNewId();
   var entry = {info: queryResult, id: id};
   Player.attachPlayerLoader(entry);
   if (position == 0)
      entry.load();
   songQueue.splice(position, 0, entry);
   return id;
}

// returns a new li fit for the main songqueue ul
function makeNewSongElement(result, id) {
   var newSong = document.createElement("li");
   newSong.setAttribute("class", "songinfo " + result.service);
   newSong.setAttribute("id", id);
   var songinfo = document.createElement("h1");
   songinfo.innerHTML = result.title;
   newSong.appendChild(songinfo);
   return newSong;
}

// handles a stop event on the draggable song list. this involves basically one
// of two situations: the song is dragged anew from the search result list or
// is simply dragged from one position to another in the queue
function onSortableStop(event, ui) {
   if (ui.item.hasClass("new-song"))
      morphResultAndAdd(ui.item, ui.item.index());
   else
      moveTrack(ui.item.attr('id'), ui.item.index())
}

// moves the element in 'songQueue' with 'track_id' to 'newIndex'. if
// 'newIndex' exceeds the length of the songQueue, the track is moved to
// the last possible position at the end of the queue. if the track does
// not exist, the list is unchanged.
// returns true if songQueue was modified, false otherwise
// POST: song in position 0 is ready for play() to be called on it
function moveTrack(track_id, newIndex) {
   var currIndex = getTrackPosition(track_id);

   if (currIndex == -1 || newIndex == currIndex)
      return false;
   if (newIndex >= songQueue.length)
      newIndex = songQueue.length - 1;
   var songInfo = songQueue[currIndex];

   if (newIndex < currIndex) {
      songQueue.splice(newIndex, 0, songInfo);  // insert
      songQueue.splice(currIndex + 1, 1);       // remove
   } else {
      songQueue.splice(currIndex, 1);           // remove
      songQueue.splice(newIndex, 0, songInfo);  // insert
   }

   // load new song if it's now at the top
   if ((currIndex == 0 && newIndex != 0) && Player.playing_id != track_id)
      songQueue[0].load();
   
   checkRep();
   return true;
}

// cuts the song completely from abstract and visual representations
// String 'tags' is added as a final epilogical field to the songQueue
// entry, before being deposited into the song graveyard. for instance
// a tag might designate that a song was "played" or not
function removeSong(position, tags) {
   if (position >= songQueue.length)
      return false;

   var victim = songQueue[position];
   victim.tags = tags;
   graveyard.push(victim);
   if (victim.stop)
      Player.stop();
   songQueue.splice(position, 1);
   $('#' + victim.id).remove();
}

// returns the index of the song with 'track_id' in the songQueue. if 
// 'track_id' isn't found, returns -1.
function getTrackPosition(track_id) {
   for (var i = 0; i < songQueue.length; i++)
      if (songQueue[i].id == track_id)
         return i;
   return -1;
}

// returns the id of the new song
function getNewId(result, position) {
   var date = new Date();
   return date.getTime() % 10000;
}

// checks that the ids of the songs in the songQueue match the ones displayed,
// but does not check that all the info is the same. returns true/false if
// tests passed or did not, logging basic error results to the console.
function checkRep() {
   var songs = $('.songinfo');
   if (songs.length != songQueue.length) {
      console.log("error: mismatching queue rep/display lengths");
      return false;
   }
   for (var i = 0; i < songs.length; i++) {
      if (songs[i].id != songQueue[i].id) {
         console.log("error: mismatching song id at index " + i);
         return false;
      }
   }
   return true;
}


