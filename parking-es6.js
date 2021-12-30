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
			if ( ye != ys ) {
				ss = ' ' + ys.toString();
				se = ' ' + ye.toString();
			}
			if ( ye != ys || ms != me ) { // years or months differ
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
			obj['location'] = obj['location'].toLowerCase()
				.replace(/as shown on map below/, '')
				.replace(/parliament hill/g, 'Parliament Hill')
				.replace(/tanza road/g, 'Tanza Road')
				.replace(/nassington road/g, 'Nassington Road')
				.replace(/south hill park gardens/g, 'South Hill Park Gardens')
				.replace(/south hill park/g, 'South Hill Park') ;
			obj['period'] = periodOf(new Date(obj['start']), new Date(obj['end']));
			return obj;
		}; 

		let stbody = document.querySelector('#from-camden'); // suspensions table body
		let stlist = document.querySelector('#parking-suspensions-list'); // suspensions list
		stbody.insertAdjacentHTML('afterbegin', req.response);
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
			    	let d = new Date( sdn.textContent );
			    	// insert data attribute data-dstring with sortable string
		    		sdn.setAttribute( "data-dstring", d.toISOString() );
		    	}
			});
		// new array of remaining nodes
		// [...stbody.children]
		// 	.sort( (a,b) => {
		// 		let adate = a.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
		// 		let bdate = b.querySelector( 'td:nth-child(3)' ).getAttribute( 'data-dstring' );
		// 		return adate>bdate ? -1 : 1;
		// 	})
		// 	.sort( (a,b) => {
		// 		let astreet = a.querySelector( 'td:nth-child(2)' ).textContent;
		// 		let bstreet = b.querySelector( 'td:nth-child(2)' ).textContent;
		// 		return astreet>bstreet ? 1 : -1;
		// 	})
		// 	.forEach( tr => {
		// 		stbody.appendChild(tr); // table
		// 		let obj = parseRow(tr);
		// 		let li = obj['period']+': '+obj['street']+', '+obj['location'];
		// 		li = '<li title="'+obj['reference']+': '+obj['reason']+'">'+li+'</li>';
		// 		stlist.insertAdjacentHTML('beforeend', li);
		// 	} );
		let listItem = (obj) => {
			let li = obj['period']+': '+obj['street']+', '+obj['location'];
			return '<li title="'+obj['reference']+': '+obj['reason']+'">'+li+'</li>';
		};
		[...stbody.children]
			.map( tr => {return parseRow(tr);})
			.sort( (a,b) => {
				let adate = new Date(a['start']), bdate = new Date(b['start']);
				let aiso =  adate.toISOString(), biso = bdate.toISOString();
				return ( a['street']+aiso ) > ( b['street']+biso ) ? 1 : -1;
			})
			.forEach( (obj,i,arr) => {
				console.log('array index ',i.toString());
				if ( i == 0 ) { // very beginning
					stlist.insertAdjacentHTML('beforeend', '<h3>' + obj['street'] + '</h3>');
					let ul = '<ul>' + listItem(obj);
					// write heading, open list, write a LI
				} else if ( obj['street'] != arr[i-1]['street'] ) { // new street
					stlist.insertAdjacentHTML('beforeend', ul + '</ul>'); // close UL and write it
					stlist.insertAdjacentHTML('beforeend', '<h3>' + obj['street'] + '</h3>'); // new street heading
					let ul = '<ul>' + listItem(obj);
				} else if ( i < arr.length-1 ) {
					ul = ul + listItem(obj);  // write a LI
				} else { // last item
					stlist.insertAdjacentHTML('beforeend', ul + listItem(obj) + '</ul>'); // close UL and write it
				}
			})
		document.getElementById('parking-suspensions').style.display = 'none';
	}
};
req.send();
