var map;
		var currPos;
		var closestDist;
		var closestMarker;
		var markers = new Array();
		var route = getURLParameter("route");

		function setCurrentPosition(position) {
			currPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			getUtaData();
		}

		function showMap(center) {
			var mapOptions = {
				center: center,
				zoom: 11,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
		
			map = new google.maps.Map(document.getElementById("map_canvas"),
				mapOptions);

			setInterval(getUtaData, 15000);
		}

		function initialize() {
			if (route != "701" && route != "703" && route != "704") {
				$("#map_canvas").hide();
				return;
			}
			else {
				$("#route_selector").remove();
				$("#map_canvas").show();
			}

			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(setCurrentPosition, getUtaData, {timeout:5000});
			}
			else {
				getUtaData();
			}
		}

		function getUtaData() {
			var jqxhr = $.getJSON('http://tracktrax.com/getUtaData?jsoncallback=?', {route: route});

			jqxhr.done(utaDataHandler);
			jqxhr.fail(utaDataErrorHandler);
		}

		function addMapMarker(vehicleRef, vehicleLocation) {
			var latLng = new google.maps.LatLng(vehicleLocation.Latitude, vehicleLocation.Longitude);
			if (!map)
				showMap(latLng);
			var markerOptions = {
				position: latLng,
				map: map,
				title: vehicleRef
			};
			var marker = new google.maps.Marker(markerOptions);
			markers.push(marker);
			if (currPos) {
				var dist = google.maps.geometry.spherical.computeDistanceBetween(currPos, latLng);
				if (!closestDist || dist < closestDist) {
					closestDist = dist;
					closestMarker = marker; 
				}
			}	
		}

		function utaDataErrorHandler() {
			alert("An error occured. If the problem persists please try again later.");
		}
		
		function utaDataHandler(data) {
					if (!markers.length) {
						if (isArray(data.MonitoredVehicleJourney)) {
							$.each(data.MonitoredVehicleJourney, function(i, entry) {
								addMapMarker(entry.VehicleRef, entry.VehicleLocation);
							});
						}
						else if (data.MonitoredVehicleJourney) {
							addMapMarker(data.MonitoredVehicleJourney.VehicleRef, data.MonitoredVehicleJourney.VehicleLocation);
						}
						
						if(closestDist) {
						  panAndZoomMapTo(closestMarker.getPosition());
						} 
					}
					else {
						showMarkerDirections(data);
					} 
		}

		function panAndZoomMapTo(latLng) {
			if (closestDist < 12000) {
				map.setZoom(15);
			}
			else if (closestDist < 8000) {
				map.setZoom(17);
			}
			else if (closestDist < 5000) {
				map.setZoom(20);
			}
			map.panTo(latLng);
		}

		function showMarkerDirections(data) {
			if (isArray(data.MonitoredVehicleJourney)) {
				$.each(data.MonitoredVehicleJourney, function(i, entry)  {
					markers.forEach(function(marker)  {
						var markerTitle = marker.getTitle();
						if (markerTitle  == entry.VehicleRef) {
							marker.setPosition(new google.maps.LatLng(entry.VehicleLocation.Latitude, entry.VehicleLocation.Longitude));
						}
					});	      
				});
			}
		}

		function isArray(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}	

		function getURLParameter(name) {
			return decodeURI(
				(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
			);
		}