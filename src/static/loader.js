HOST = 'http://128.208.1.137:5000/';

jQuery(function(){
   // search result pulldown
   $('#results').hide();
   initServiceColorMap();
   $('#searchfield').keyup(function(event) {
      handleNewSearchText(event.which)
   });

   // ajax loading animation
   $(document).ajaxStart(function() {
      $('#rotator').show();
   });
   $(document).ajaxStop(function() {
      $('#rotator').hide();
   });

   // draggable/sortable jquery ui features
   $("#songlist").sortable({
      revert: true,
      stop: onSortableStop
   });
   $( "ul, li" ).disableSelection();

   // load up the soundcloud javascript functions
   SC.initialize({
      client_id: "6f8f25b3601ce9366071e6b0a42a4573",
      redirect_uri: ""
   });

   // attach play and pause handlers
   $('#playbutton').click(function() {
      var success = Player.play();
      if (success) {
         showPauseDisplay();
      } else {
         showPlayDisplay();
      }
   });
   $('#pausebutton').click(function() {
      Player.pause();
      showPlayDisplay();
   });

   loadPitchforkHandler();
   loadAsyncYTAPI();
});

// Initializes a global map (assoc. array) mapping service names to display colors
var servicecolor = [];
function initServiceColorMap() {
   servicecolor['soundcloud'] = 'orange';
   servicecolor['youtube'] = 'red';
   servicecolor['other'] = 'black';
}


function loadPitchforkHandler() {
   var button = $('#pitchfork');
   button.off('click');
   button.click(function() {
      getPitchfork(10);
   });
}

function showPlayDisplay() {
   $('#pausebutton').hide();
   $('#playbutton').show();
}

function showPauseDisplay() {
   $('#playbutton').hide();
   $('#pausebutton').show();
}

var onYouTubeIframeAPIReady;// = function() { console.log('yo'); };

function loadAsyncYTAPI() {
   // load the IFrame Player API code asynchronously
   var tag = document.createElement('script');
   tag.src = "https://www.youtube.com/iframe_api";
   var firstScriptTag = document.getElementsByTagName('script')[0];
   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

   onYouTubeIframeAPIReady = function() {
      var YTP;
      YTP = new YT.Player('ytplayer', {
         height: '100',
         width: '100',
         events: {
            'onReady': function(event) { yt_callbacks.player = YTP; }
         }
      });
   }
}




