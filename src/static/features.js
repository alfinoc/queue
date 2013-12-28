function getPitchfork(limit) {
	$.ajax({
	  url: 'http://128.208.1.137:5000/lists',
	  data: {pitchfork : '', limit : limit},
	  success: function(resp) {
	  	loadResults(resp.results);
	  	var button = $('#pitchfork');
	  	button.html('ADD ALL');
	  	button.off('click');
	  	button.click(function() {
	  		clearPitchforkHandler();
	  		var results = $('.resultwrap');

	  		for (var i = 0; i < results.length; i++) {
				var data = $('#resultnum_' + i).data('results');
				addToQueueBottom(data);
			}

	  		clearResults();
	  	});
	  },
	  dataType: 'json',
	  error: function (error) {
		if (error.status === 200)
			console.log("ajax error. it's probably that the json isn't formatted correctly");
		else
			console.log('it is some other error: ' + error.status);;
	  }
	});
}

function clearPitchforkHandler() {
	$('#pitchfork').html('PITCHFORK');
	loadPitchforkHandler();
}