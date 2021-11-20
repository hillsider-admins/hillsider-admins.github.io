// fetch from server latest table of parking suspensions
let req = new XMLHttpRequest();
req.open('GET', "./data/table.html");
req.onload = function() {
	if (req.status != 200){
		console.log('*** ERROR Failed to load parking suspensions\nHTTP response ' + String(req.status) );
	} else {
		console.log('Table data received');
		let stbody = document.querySelector('#from-camden'); // suspensions table body
		stbody.insertAdjacentHTML('afterbegin', req.response);
		let now = new Date();
		let tmw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // midnight tonight
		let dat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2); // day after tomorrow
		// remove duplicates, insert sortable datestrings
		let seen = {};
		[...stbody.children]
			.forEach(function(tr){ //iterate on the list of TR nodes
			    let sdn = tr.querySelector( 'td:nth-child(3)' ); // start-date node
				let txt = tr.textContent;
			    if ( seen[txt] || !sdn ) // if duplicate or null
			        tr.remove();
			    else {
			        seen[txt] = true; // seen this one now
			    	let sd = new Date( sdn.textContent );
			    	// insert data attribute data-dstring with sortable string
		    		sdn.setAttribute( "data-dstring", sd.toISOString() );
		    		// set classes for active and impending suspensions
		    		if ( sd < tmw )
		    			tr.setAttribute( 'class', 'active' );
			    	else if ( sd < dat )
			    		tr.setAttribute( 'class', 'impending' );
		    	}
			});
		// new array without removed nodes
		[...stbody.children]
			.sort(function(a,b){
				let adate = a.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
				let bdate = b.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
				return adate>bdate ? 1 : -1;
			})
			.forEach(tr=>stbody.appendChild(tr)); // simplified function syntax
	}
};
req.send();
