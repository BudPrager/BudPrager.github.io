window.onload = startGui;
function startGui(){
	// make a new javascript markdown converter
	converter = new Showdown.converter();
	
	// Get all the data from dropbox
	getData("3hiex5rdumkcthp", "unplayed.markdown");
	getData("grvgh91697k1vq8", "unbeaten.markdown");
	getData("hwaoanz6imhbdkm", "completed.markdown");
	getData("7i1abbuqtngl4ke", "multiplayer.markdown");

    // add star ratings to the abandoned and the beaten lists
	starIt("multiplayer");
	starIt("completed");
	
	// if we don't call the star-rating api after the html has changed, all we get is radio buttons - yeuch
	$('input[type=radio].star').rating();
}

function spanIt(rawHtml)
{
	// backup the raw html
	var changedHtml = rawHtml;
	// replace the brackets
	changedHtml = changedHtml.replace(/\(/g, "<span>");
	changedHtml = changedHtml.replace(/\)/g, "</span>");
	// send the shiny new html back
	return changedHtml;
}

function starIt(holdingId)
{
	// find the right DOM element
	var html = "";
	var selector = "#" + holdingId;	
	var $column = $(selector);
	
	// for each list item in the DOM element (every game in a column)
	$column.find('li').each(function (index){
		var htmlBlock = $(this).html();
		// try to find the star rating e.g. [3/5]
		var allStarRatings = htmlBlock.match(/\[\d\/\d\]/g);
		
		// get the number of stars we want to give the game
        var starRating = /\[(\d)\/(\d)\]/g;
		if(allStarRatings != null && typeof(allStarRatings) != 'undefined')
		{
			if(allStarRatings.length > 0){
				var match = starRating.exec(allStarRatings[0]); //regex match
				
				html += "<div class='starRatingHolder'>";
				
				// create the inputs based on the number of stars we want to give
				for(var i = 1; i <= parseInt(match[2]); i++)
				{
					if(i == parseInt(match[1]))
					{
						// this one is checked to show it's where the stars should stop
						html += "<input name='star-rating-" + holdingId + "-" + index + "' type='radio' class='star' disabled='disabled' checked='checked'\/>";
					}
					else{
						html += "<input name='star-rating-" + holdingId + "-" + index + "' type='radio' class='star' disabled='disabled'\/>";
					}
				}
				
				html += "</div>";
			}
		}
		
		// actually remove the [3/5] from the page
		htmlBlock = htmlBlock.replace(/\[\d\/\d\]/g, "");
		htmlBlock += html;
		
		// add the new html to the DOM
		$(this).html(htmlBlock);
		
		// blank down the vars we used
		html = "";
		htmlBlock = "";
	});
}

function percentageIt(holdingId){
    // find the right DOM element
    var html = "";
    var selector = "#" + holdingId;
    var $column = $(selector);

    // for each list item in the DOM element (every game in a column)
    $column.find('li').each(function (index) {
        var htmlBlock = $(this).html();
        // try to find the star rating e.g. [3/5]
        var allStarRatings = htmlBlock.match(/\[\d+%\]/g);

        // get the number of stars we want to give the game
        var starRating = /\[(\d+)%\]/g;
        if (allStarRatings != null && typeof (allStarRatings) != 'undefined') {
            if (allStarRatings.length > 0) {
                var match = starRating.exec(allStarRatings[0]); //regex match

                var percentage = match[1];

                html += "<div class='progress' style='height: 10px; width: 150px; margin-bottom:5px'>"
                        + "<div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='" + percentage + "' aria-valuemin='0' aria-valuemax='100' style='width:" + percentage + "%; font-size:xx-small;line-height:11px;' data-placement='bottom' data-toggle='tooltip' title='" + percentage + "% complete'>"
                            + percentage + "% <span class='sr-only'>" + percentage + "% Complete</span>"
                        + "</div>"
                    + "</div>";
            }
        }

        // actually remove the [60%] from the page
        htmlBlock = htmlBlock.replace(/\[\d+%\]/g, "");
        htmlBlock += html;

        // add the new html to the DOM
        $(this).html(htmlBlock);

        // blank down the vars we used
        html = "";
        htmlBlock = "";
    });
}

function playerIt(holdingId) {

}

function dataCalledBack(nameOfFile, data)
{
	switch(nameOfFile)
	{	
		case "unplayed.markdown":
			var unplayedGames = spanIt(converter.makeHtml(data));
			$("#unplayed").html(unplayedGames);
			break;
		case "unbeaten.markdown":
			var unbeatenGames = spanIt(converter.makeHtml(data));
			$("#unbeaten").html(unbeatenGames);
			percentageIt("unbeaten");
			break;
		case "completed.markdown":
			var completedGames = spanIt(converter.makeHtml(data));
			$("#completed").html(completedGames);
			starIt("completed");
			break;
		case "multiplayer.markdown":
			var multiplayerGames = spanIt(converter.makeHtml(data));
			$("#multiplayer").html(multiplayerGames);
			starIt("multiplayer");
			break;
		default:
			alert("No data found!");
			break;
	}
	
	// if we don't call the star-rating api after the html has changed, all we get is radio buttons - yeuch
	$('input[type=radio].star').rating();
}

function createCORSRequest(method, url){
	var xhr = new XMLHttpRequest();
  	if ("withCredentials" in xhr){
		// XHR has 'withCredentials' property only if it supports CORS
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined"){ // if IE use XDR
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		xhr = null;
	}
	return xhr;
}

function getData(shareId, nameOfFile)
{
	var markdownData = null;
	
	var request = createCORSRequest( "get", "https://dl.dropboxusercontent.com/s/" + shareId + "/" + nameOfFile + "?dl=1" );
	if ( request ){
  		// Define a callback function
  		request.onload = function(){
  			//markdownData = data;
  			dataCalledBack(nameOfFile, request.responseText);
  		};
  		// Send request
  		request.send();
	}

	return markdownData;
}