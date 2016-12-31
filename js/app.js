var sIndex = 0;

var download = '&download=epub'; //only epub supported
var filter = '&filter=free-ebooks';
var startIndex; //= '&startIndex=' + sIndex;
var maxResults = '&maxResults=40';
var orderBy = '&orderBy=newest'; // sorted by relevance by default
var langRestrict = '&langRestrict=en';

// special keywords for query
var intitle = 'intitle:';
var inauthor = 'inauthor:';
var inpublisher = 'inpublisher:';
var subject = 'subject:';
var isbn = 'isbn:';
var lccn = 'lccn:';
var oclc = 'oclc:';

var answerers;
var search;

var tempTotal;

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum, total) {
	var start, end;

	start = sIndex + 1;
	if ((sIndex + 40) <= total) {
		end = sIndex + 40;
	} else {
		end = total;
	}
	

	//var results = 'Showing ' + resultNum + ' ebooks out of ' + total + ' for <strong>' + query + '</strong>';
	var results = 'Showing ebooks ' + start + ' - ' + end + ' out of ' + total + ' for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};


var getInspiration = function() {
	

	//search = answerers + download + filter + langRestrict + maxResults + orderBy;
	
	var query =
		'https://www.googleapis.com/books/v1/volumes?q=' +
		search; 
	
	$.ajax({
		url: query,
		dataType: "jsonp",
		type: "GET",
		})
		.done(function(result){
			tempTotal = result.totalItems; // keep track for pagination
			var searchResults = showSearchResults(answerers, result.items.length, result.totalItems);

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

	$('.inspiration-getter').submit( function(){
		sIndex = 0;
		startIndex = '&startIndex=' + sIndex;
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		answerers = $(this).find("input[name='answerers']").val();
		$(this).find("input[name='answerers']").val('');
		search = answerers + download + filter + langRestrict + startIndex + maxResults + orderBy;
		getInspiration();
		$('button.next').show();
	});

	$('button.next').click(function() {
		if ((sIndex + 40) <= tempTotal) {
			$('button.back').show();
			sIndex = sIndex + 40;
			startIndex = '&startIndex=' + sIndex;
			search = answerers + download + filter + langRestrict + startIndex + maxResults + orderBy;
			$('.results').html('');
			getInspiration();	
		} else {}
		if ((sIndex + 40) > tempTotal) {
			$('button.next').hide();
		}
		
	});

	$('button.back').click(function() {
		if ((sIndex - 40) >= 0) {
			$('button.next').show();
			sIndex = sIndex - 40;
			startIndex = '&startIndex=' + sIndex;
			search = answerers + download + filter + langRestrict + startIndex + maxResults + orderBy;
			$('.results').html('');
			getInspiration();	

		} else {}
		if (sIndex == 0) {
			$('button.back').hide();
		}
	});
});