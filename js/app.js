// this function takes the question object returned by StackOverflow 
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
						 'href=https://stackoverflow.com/users/' + question.owner.user_id + ' >' +
							question.owner.display_name +
						'</a>' +
				'</p>' +
				'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' ebooks for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { tagged: tags,
					site: 'stackoverflow',
					order: 'desc',
					sort: 'creation'};
	
	$.ajax({
		url: "https://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
		.done(function(result){
			var searchResults = showSearchResults(request.tagged, result.items.length);

			$('.search-results').html(searchResults);

			$.each(result.items, function(i, item) {
				var question = showQuestion(item);
				$('.results').append(question);
			});
		})
		.fail(function(jqXHR, error){
			var errorElem = showError(error);
			$('.search-results').append(errorElem);
		});
};

var getInspiration = function(answerers) {
	var search = answerers;
	var subject =
		'subject:' +
		search;
	var query = 'https://www.googleapis.com/books/v1/volumes?q='+ search +'&filter=free-ebooks&langRestrict="en"&maxResults=40'; //&startIndex=0
	var request = { 
					tagged: answerers,
					site: 'stackoverflow',
					order: 'desc',
					sort: 'creation'
				};
	
	$.ajax({
		//url: "https://api.stackexchange.com/2.2/tags/" + answerers + "/top-answerers/month",
		url: query,
		//data: request,
		dataType: "jsonp",
		type: "GET",
		})
		.done(function(result){
			var searchResults = showSearchResults(answerers, result.items.length);

			$('.search-results').html(searchResults);
			console.log(result);
			$.each(result.items, function(i, item) {
				var inspire = showInspiration(item);
				$('.results').append(inspire);
			});
		})
		.fail(function(jqXHR, error){
			var errorElem = showError(error);
			$('.search-results').append(errorElem);
		});
};

var showInspiration = function(item) {


	//console.log(item);
	var result = $('.templates .inspiration').clone();
	var user = result.find('.user a')
		.attr('href', item.volumeInfo.infoLink)
		.text(item.volumeInfo.title);
	// result.find('.reputation').text('Reputation: ' + item.user.reputation);
	//if (item.volumeInfo.imageLinks.thumbnail != undefined) {
	if (item.volumeInfo.hasOwnProperty('imageLinks')) {
		var img = '<a href="' + item.volumeInfo.infoLink + '" target="_blank"><img src="' + item.volumeInfo.imageLinks.thumbnail +'"></a>';
		result.find('.post_count').append(img);	
	}
	if (item.volumeInfo.hasOwnProperty('authors')) {
		result.find('.score').text('Authors: ' + item.volumeInfo.authors);
	}
	

	return result;
};

$(document).ready( function() {
	$('.unanswered-getter').submit( function(){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		$(this).find("input[name='tags']").val('');
		getUnanswered(tags);
	});

	$('.inspiration-getter').submit( function(){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var answerers = $(this).find("input[name='answerers']").val();
		$(this).find("input[name='answerers']").val('');
		getInspiration(answerers);
	});
});