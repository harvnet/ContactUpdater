
var app = {
  	name: "Midterm App",
  	version: "1.2.3",
	links: [],
	numPages: 0,
	pageTime: 500,
	lat: "",
	long: "",
	
	
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
		
		var options = new ContactFindOptions();
		options.filter = "";
		options.multiple = true;
		var fields = ["displayName"]; 
		navigator.contacts.find(fields, app.successFunc, app.errFunc, options);	
		
		if( navigator.geolocation ){ 		  
			var params = {enableHighAccuracy: true, timeout:9000, maximumAge:5000};
			navigator.geolocation.getCurrentPosition( app.reportPosition, app.gpsError, params ); 
		} else {
			alert("Sorry, your browser does not support location tools.");
		}
		
    	document.getElementById("btnOK").addEventListener("click", app.ok);
	 
  	},
	
	successFunc: function( matches ){
		var div = document.getElementById("displaycontact");
		var nameul = document.createElement("ul");
		var name = '';
		var phone1 = '';
		var phone2 = '';
		var phone1type = '';
		var phone2type = '';
		var listview = [];
		
		nameul.setAttribute("data-role","listview");
		var session = {
			'contact' :[],
			'state'	: true
		};
		
		for (i=0; i<matches.length; i++)
		{	
			if (matches[i].displayName != null) {   // test to see if contact name was entered
				nameul.innerHTML += '<li>' + matches[i].displayName + '</li>';	
				
				listview[i] = document.querySelector('<li>');
			} else {
				nameul.innerHTML += '<li>' + 'Name not Listed' + '</li>';
				
				listview[i] = document.querySelector('<li>');
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
			

			session.contact.push({ 'name': matches[i].displayName, 
								   'phone1': phone1,
								   'phone2': phone2,
								   'lat': ' ', 'long': ' ' });
	
		
		}

		div.appendChild(nameul);
		
		localStorage.setItem('session-harv0116', JSON.stringify(session));
		
		// HAMMER
		
		var myElement = document.querySelector(listview[item]);

		var mc = new Hammer.Manager(myElement);

		mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			// Single tap recognizer
		mc.add( new Hammer.Tap({ event: 'singletap' }) );
		
		mc.get('doubletap').recognizeWith('singletap');
			// we only want to trigger a tap, when we don't have detected a doubletap
		mc.get('singletap').requireFailure('doubletap');

		mc.on("singletap", app.view);
		
		mc.on("doubletap", app.map); 
		console.log(mc);
		
		//document.querySelector("[data-role=listview]").addEventListener("click", app.view);
		
		 
	},
	errFunc: function ( ) {
		alert("The contact could not be found");
	},
	ok: function(ev){
		document.querySelector("[data-role=modal]").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";
	},
	view: function(ev){
		ev.stopPropagation();
		document.querySelector("[data-role=modal]").style.display="block";
		document.querySelector("[data-role=overlay]").style.display="block";
	
		var item = ev.target.getAttribute("data-ref");
		//var itemVal = ev.target.innerHTML;
		//document.getElementById("list").value = item;
		
		var restoredSession = JSON.parse(localStorage.getItem('session-harv0116'));
		//console.log(restoredSession);
		
		var contactName = restoredSession.contact[item].name;
		var contactPhone1 = restoredSession.contact[item].phone1;
		var contactPhone2 = restoredSession.contact[item].phone2;
		var contactLat = restoredSession.contact[item].lat;
		var contactLong = restoredSession.contact[item].long;
		
		console.log("MADE IT HERE - SINGLE TAP");
		// draw modal
		document.querySelector("[data-role=modal] h3").innerHTML = "Contact Information";
		
		document.getElementById("contNameText").placeholder = contactName;
		document.getElementById("contPhone1Text").placeholder = contactPhone1;
		document.getElementById("contPhone2Text").placeholder = contactPhone2;
		document.getElementById("contLatText").placeholder = contactLat;
		document.getElementById("contLongText").placeholder = contactLong;
		
		// display all of contact information here.  Name & 2 Phone Numbers.
	},
	map: function(ev){
		ev.stopPropagation()
		document.querySelector("[data-role=modal]").style.display="none";
		document.querySelector("[data-role=overlay]").style.display="none";
		document.querySelector("#home").style.display="none";
		document.querySelector("#geo").style.display="block";		
	
		var item = ev.target.getAttribute("data-ref");
		var restoredSession = JSON.parse(localStorage.getItem('session-harv0116'));
		var contactName = restoredSession.contact[item].name;
		var contactPhone1 = restoredSession.contact[item].phone1;
		var contactPhone2 = restoredSession.contact[item].phone2;
		var contactLat = restoredSession.contact[item].lat;
		var contactLong = restoredSession.contact[item].long;
		

		if (contactLat.trim()=="" || contactLong.trim()=="") {
			
			var gpsLatLng = new google.maps.LatLng(app.lat, app.long);
			var mapOptions = {
				// center map
				center: gpsLatLng,
				zoom: 14,
				scalecontrol: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			var map = new google.maps.Map(document.getElementById("mapoutput"), mapOptions);
			
			
			alert("Double tap anywhere to set the position for the contact");
			
			//HAMMER TO SET THE LOCATION MARKER
			
			var dc = new Hammer(map);
		
			dc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			
			dc.add( new Hammer.Tap({ event: 'singletap' }) );
		
			dc.get('doubletap').recognizeWith('singletap');
		
			// we only want to trigger a tap, when we don't have detected a doubletap
			dc.get('singletap').requireFailure('doubletap');
		
			dc.on('doubletap', app.addLocation);
						
		
		} else {
			var myLatLng = new google.maps.LatLng(contactLat,contactLong);
			var mapOptions = {
				// center map
				zoom: 14,
				center: myLatLng,
				scalecontrol: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			
			var map = new google.maps.Map(document.getElementById("mapoutput"), mapOptions);
		
			
		}
		
		// event listener for back button
		
	},

	addLocation: function(ev) {
	
	// we have item????
	// we have local storage
	
	console.log ("BY SOME LUCK WE GOT HERE!!!");
	ev.stopPropagation();
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		animation: google.maps.Animation.BOUNCE
		
	});

	
	if (marker.getAnimation() != null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
	}
	
	session.contact[item].splice(item, 1, [{'name': contactName,
								 'phone1': contactPhone1,
								 'phone2': contactPhone2,
								 'lat': app.lat,
								 'long': app.long }]);
	
	localStorage.setItem('session-harv0116', JSON.stringify(session));

	},
	reportPosition: function(position) {
		app.lat = position.coords.latitude;
		app.long = position.coords.longitude;
	},
	gpsError: function( error ){	   		
		var errors = {
			1: 'Permission denied',
			2: 'Position unavailable',
			3: 'Request timeout'
		};		
		alert("Error: " + errors[error.code]);
	}

};
app.initialize();


