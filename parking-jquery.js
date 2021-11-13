// fetch from server latest table of parking suspensions
$($.get('./data/table.html', function( data ){
	// insert into empty table body
	$("#from-camden").append( data )
	// remove duplicate rows
	var seen = {};
	$('#from-camden tr').each(function() {
	    var txt = $( this ).text();
	    if (seen[txt])
	        $( this ).remove();
	    else
	        seen[txt] = true;
	});
}) )
