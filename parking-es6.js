// fetch from server latest table of parking suspensions
let req = new XMLHttpRequest();
req.open('GET', "./data/table.html");
req.onload = () => {
	if (req.status != 200){
		console.log('*** ERROR Failed to load parking suspensions\nHTTP response ' + String(req.status) );
	} else {
		console.log('Table data received');

		let periodOf = (s,e) => {
			const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			let str = '';
			let ss = '', se = '';
			let ys = s.getFullYear(), ye = e.getFullYear();
			let ms = s.getMonth(),    me = e.getMonth();
			let ds = s.getDate(),     de = e.getDate();
			let differ = 1 < ye-ys; // if years differ  by more than 1
			if (differ) {
				ss = ' ' + ys.toString();
				se = ' ' + ye.toString();
			}
			if (differ || ms != me) { // years or months differ
				ss = ' ' + months[ms] + ss;
				se = ' ' + months[me] + se;
				str = ds.toString()+' '+ss+'-'+de.toString()+' '+se;
			} else if (ds != de) { // only days differ
				str = ds.toString()+'-'+de.toString()+' '+months[ms];
			} else { // no differences: 1-day period
				str = ds.toString()+' '+months[ms];
			}
			return str;
		};

		let parseRow = tr => {
			let tds = [...tr.children].map(td=>td.textContent), obj = {};
			['reference','street','start','days','end','reason','location'].forEach((key,ind)=>obj[key]=tds[ind]);
			obj['street'] = obj['street'].toLowerCase().split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
			obj['location'] = obj['location'].replace(/as shown on map below/g, '');
			obj['period'] = periodOf(new Date(obj['start']), new Date(obj['end']));
			return obj;
		}; 

		let stbody = document.querySelector('#from-camden'); // suspensions table body
		let stlist = document.querySelector('#parking-suspensions-list'); // suspensions list
		stbody.insertAdjacentHTML('afterbegin', req.response);
		let now = new Date();
		let tonight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // midnight tonight
		let soon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2); // day after tomorrow
		// remove duplicates, insert sortable datestrings
		let seen = {};
		[...stbody.children]
			.forEach( tr => { //iterate on the list of TR nodes
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
		    		if ( sd < tonight )
		    			tr.setAttribute( 'class', 'active' );
			    	else if ( sd < soon )
			    		tr.setAttribute( 'class', 'impending' );
		    	}
			});
		// new array of remaining nodes
		[...stbody.children]
			.sort( (a,b) => {
				let adate = a.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
				let bdate = b.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
				return adate>bdate ? 1 : -1;
			})
			.forEach( tr => {
				stbody.appendChild(tr); // table
				let obj = parseRow(tr);
				let li = obj['period']+': '+obj['street']+', '+obj['location'].toLowerCase();
				li = '<li title="'+obj['reference']+': '+obj['reason']+'">'+li+'</li>';
				stlist.insertAdjacentHTML('beforeend', li);
			} );
		document.getElementById('parking-suspensions').style.display = 'none';
	}
};
req.send();
