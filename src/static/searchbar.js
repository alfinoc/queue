// Handle a key press event on the search field
function handleNewSearchText(key) {
   var query = $('#searchfield').val();

   if (query == "") {
      clearResults();
   } else if (key == 13) { // 'enter/return'       
      $.ajax({
        url: HOST,
        data: {q : query, limit : 3},
        success: function(resp) { loadResults(resp.results); },
        dataType: 'json',
        error: function (error) {
         if (error.status === 200)
            console.log("ajax error. it's probably that the json isn't formatted correctly");
         else
            console.log('it is some other error: ' + error.status);;
        }
      });
   }
}

// Clears the listed search results (animated)
function clearResults() {
   $('#results').slideUp(100, function() {
      $('#searchfield').removeClass("squarebottom");
      $('#searchfield').addClass("roundbottom");
      $('#results').html("");
   });
   clearPitchforkHandler();
}

// Loads a new set of 'results' from argument list of
// result objects of the form {text, color}. Animated
// iff no other search results displayed at call time.
function loadResults(results) {
   $('#results').html("");
   if (results.length > 0) {
      $('#searchfield').removeClass("roundbottom");
      $('#searchfield').addClass("squarebottom");
   }

   for (var i = 0; i < results.length; i++) {
      // prepare resultwrap li
      var resultwrapli = document.createElement("li");
      resultwrapli.setAttribute("class", "resultwrap new-song "
                        + servicecolor[results[i].service] + "flag");
      resultwrapli.setAttribute("id", "resultnum_" + i);

      // prepare result div
      var resultdiv = document.createElement("div");
      resultdiv.setAttribute("class", "result");
      var content = document.createElement("p");
      content.innerHTML = results[i].title;
      resultdiv.appendChild(content);

      // append the results
      resultwrapli.appendChild(resultdiv);
      $("#results")[0].appendChild(resultwrapli);

      // attach event handlers for click and drag
      $(resultdiv).click( createCallback(addToQueueBottom, results[i]) );

      // here we smuggle the result id along with the paragraph, so that on
      // the other end of the drag, we can pull apart the title really quickly
      // from the <p> and also grab the id of the result that we did the drag
      // from. then we make sure the data is tied to that results jQuery data,
      // so we can get at it whenever
      content.setAttribute("result_id", "#resultnum_" + i);
      $("#resultnum_" + i).data("results", results[i]);

      $(resultwrapli).draggable({
         connectToSortable: "#songlist",
         helper: "clone",
         revert: "invalid",
         start: function(event, ui) {
            // attach a temporary id to the helper to attach CSS rules to while
            // the helper is technically not yet a ui-sortable-helper
            ui.helper.addClass('dragging');
         },
      });
      jQuery.data($('resultnum_' + i), "results", results[i]);
   }

   if ($('#results').is(":hidden"))
      $('#results').slideDown("fast");
}

// returns an anonymous function that calls 'fn' with parameter 'param'
function createCallback(fn, param) {
   return function() { fn(param); }
}

