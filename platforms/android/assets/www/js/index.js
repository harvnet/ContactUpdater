var app = {
  	name: "Midterm App",
  	version: "1.2.3",
	links: [],
	numPages: 0,
	pageTime: 500,
	lat: "",
	long: "",
	themap: "",
	session: {
			'contact' :[],
			'state'	: true
		},
	pname: document.createElement("p"),
	pphone1: document.createElement("p"),
	pphone2: document.createElement("p"),
	plat: document.createElement("p"),
	plong: document.createElement("p"),
	markers: [],
	restoredSession: "",
	contactName: "",
	contactPhone1: "",
	contactPhone2: "",
	contactLat: "",
	contactLong: "",
	
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
		app.geolocation();
		app.contacts();
  	},
	geolocation: function() {
		if( navigator.geolocation ){ 		  
			var params = {enableHighAccuracy: true, timeout:9000, maximumAge:5000};
			navigator.geolocation.getCurrentPosition( app.reportPosition, app.gpsError, params ); 
		} else {
			alert("Sorry, your browser does not support location tools.");
		}
	},
	contacts: function() {
		var options = new ContactFindOptions();
		options.filter = "";
		options.multiple = true;
		var fields = ["displayName"]; 
		navigator.contacts.find(fields, app.successFunc, app.errFunc, options);	
	},

	successFunc: function( matches ){
		var div = document.getElementById("displaycontact");
		var nameul = document.createElement("ul");
		var name = '';
		var phone1 = '';
		var phone2 = '';
		var phone1type = '';
		var phone2type = '';
		
		nameul.setAttribute("data-role","listview");
		for (i=0; i<matches.length; i++)
		{	
			if (matches[i].displayName != null) {   // test to see if contact name was entered
				var li = document.createElement("li");
				li.dataset.ref = i;
				li.innerHTML = matches[i].displayName;
	
			} else {
				var li = document.createElement("li");
				li.dataset.ref = i;
				li.innerHTML = 'Name not Listed';

			}
			
			if (matches[i].phoneNumbers) {
				for (var j=0; j<matches[i].phoneNumbers.length; j++) 
				{
					if (j==0) {
						phone1 = matches[i].phoneNumbers[0].value;
					} else {
						phone2 = matches[i].phoneNumbers[1].value;
					}
				} 
			}
			
			app.session.contact.push({ 'name': matches[i].displayName, 
								   'phone1': phone1,
								   'phone2': phone2,
								   'lat': ' ', 'long': ' ' });
			nameul.appendChild(li);

		}

		div.appendChild(nameul);
		
		localStorage.setItem('session-harv0116', JSON.stringify(app.session));
	
			
			var listview = document.querySelector('ul');		
		
			var hammertime = new Hammer.Manager(listview);	
			var singleTap = new Hammer.Tap({ event: 'singletap' });
			var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
			hammertime.add([doubleTap, singleTap]);
			doubleTap.requireFailure(singleTap);

			 hammertime.on("singletap", function(ev) {
				//ev.preventDefault();
				console.log(ev);
				app.view(ev);
			});
			hammertime.on("doubletap", function(ev) {
				//ev.preventDefault();
				console.log(ev);
				app.map(ev);
			});
			 
	},
	errFunc: function ( ) {
		alert("The contact could not be found");
	},
	ok: function(ev){
		document.querySelector("[data-role=modal]").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";
		
	},
	view: function(ev){
		document.querySelector("[data-role=modal]").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";
	
		var item = ev.target.getAttribute("data-ref");
		
		restoredSession = JSON.parse(localStorage.getItem('session-harv0116'));
		
		contactName = restoredSession.contact[item].name;
		contactPhone1 = restoredSession.contact[item].phone1;
		contactPhone2 = restoredSession.contact[item].phone2;
		contactLat = restoredSession.contact[item].lat;
		contactLong = restoredSession.contact[item].long;
		
		//console.log("MADE IT HERE - SINGLE TAP");
		// draw modal
		document.querySelector("[data-role=modal] h3").innerHTML = "Contact Information";
		
		var divname = document.getElementById("name");
		var divphone1 = document.getElementById("phone1");
		var divphone2 = document.getElementById("phone2");
		var divlat = document.getElementById("latitude");
		var divlong = document.getElementById("longitude");
		
		if (app.trim(contactName) == null) {
			contactName = "Name not listed";
		}
		if (app.trim(contactPhone1.toString()) == null) {
			contactPhone1 = "Phone not listed";
		}
		if (app.trim(contactPhone2.toString()) == null) {
			contactPhone2 = "&nbsp;";
		}
		
		if (app.trim(contactLat.toString()) == null || app.trim(contactLat.toString()) == "") {
			contactLat = "Coordinates not inputted";
		}
		if (app.trim(contactLong.toString()) == null || app.trim(contactLong.toString()) == "") {
			contactLong = "Coordinates not inputted";
		}
		
		app.pname.innerHTML = contactName;
		app.pphone1.innerHTML = contactPhone1;
		app.pphone2.innerHTML = contactPhone2;
		app.plat.innerHTML = contactLat;		
		app.plong.innerHTML = contactLong;		
	
		divname.appendChild(app.pname);
		divphone1.appendChild(app.pphone1);
		divphone2.appendChild(app.pphone2);
		divlat.appendChild(app.plat);		
		divlong.appendChild(app.plong);
		
		document.getElementById("btnOK").addEventListener("click", app.ok);

	},
	map: function(ev){
		document.querySelector("[data-role=modal]").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";
		document.querySelector("#home").style.display="none";
		document.querySelector("#geo").style.display="block";		
	
		var item = ev.target.getAttribute("data-ref");
		restoredSession = JSON.parse(localStorage.getItem('session-harv0116'));
		
		contactName = restoredSession.contact[item].name;
		contactPhone1 = restoredSession.contact[item].phone1;
		contactPhone2 = restoredSession.contact[item].phone2;
		contactLat = restoredSession.contact[item].lat;
		contactLong = restoredSession.contact[item].long;
		
		console.log ("LAT = " + app.lat + " LONG = " + app.long);


		if (app.trim(contactLat.toString())==null || app.trim(contactLat.toString())=="" || app.trim(contactLong.toString())==null || app.trim(contactLong.toString())=="") {
			
			var gpsLatLng = new google.maps.LatLng(app.lat, app.long);
			var mapOptions = {
				// center map
				center: gpsLatLng,
				disableDoubleClickZoom: true,
				zoom: 14,
				scalecontrol: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			app.themap = new google.maps.Map(document.getElementById("mapoutput"), mapOptions);
			
			alert("Double tap anywhere to set the position for the contact");
						
			google.maps.event.addListener(app.themap, 'dblclick', function(event) {
			   app.addLocation(event.latLng, item);
			});
			
		} else {
			var myLatLng = new google.maps.LatLng(contactLat,contactLong);
			var mapOptions = {
				// center map
				zoom: 14,
				center: myLatLng,
				disableDoubleClickZoom: true,
				scalecontrol: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			
			app.themap = new google.maps.Map(document.getElementById("mapoutput"), mapOptions);
		
			var marker = new google.maps.Marker({
      			position: myLatLng,
      			map: app.themap
  			});
		}
		
		var backbutton = document.getElementById('btnBack');		
		
		var mc = new Hammer.Manager(backbutton);	
		var singleTap = new Hammer.Tap({ event: 'singletap' });
		mc.add([singleTap]);

		 mc.on("singletap", function(ev) {
			//ev.preventDefault();
			document.querySelector("#home").style.display="block";
			document.querySelector("#geo").style.display="none";
		});	
	},

	addLocation: function(location, record) {
	
		console.log ("BY SOME LUCK WE GOT HERE!!!");
		console.log ("GPS " + app.lat + " " + app.long);
		console.log (location.lat());
		console.log (location.lng());
		
		app.deleteMarkers();
		
		marker = new google.maps.Marker({
			position: location,
			map: app.themap,
			animation: google.maps.Animation.DROP	
		});
	  	app.markers.push(marker);
		
		if (marker.getAnimation() != null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	
		// setLocalVariable
		restoredSession.contact[record].lat = location.lat();
		restoredSession.contact[record].long = location.lng();		
		
		localStorage.setItem("session-harv0116", JSON.stringify(restoredSession) );
	},
	
			// Sets the map on all markers in the array.
	setAllMap: function(map) {
		  for (var i = 0; i < app.markers.length; i++) {
			app.markers[i].setMap(map);
		  }
		},
		
		// Removes the markers from the map, but keeps them in the array.
	clearMarkers: function() {
		  app.setAllMap(null);
		},
		
		// Shows any markers currently in the array.
	showMarkers: function() {
		  app.setAllMap(map);
		},
		
		// Deletes all markers in the array by removing references to them.
	deleteMarkers: function() {
		  app.clearMarkers();
		  app.markers = [];
		},
		
	reportPosition: function(position) {
		app.lat = position.coords.latitude;
		app.long = position.coords.longitude;
		console.log ("LAT = " + app.lat + " LONG = " + app.long);
	},
	gpsError: function( error ){	   		
		var errors = {
			1: 'Permission denied',
			2: 'Position unavailable',
			3: 'Request timeout'
		};		
		alert("Error: " + errors[error.code]);
	},
	trim: function(str) {
		if (str == null) {
			return str;
		} else {
        	return str.replace(/^\s+|\s+$/g,"");
		}
	}

};
app.initialize();
