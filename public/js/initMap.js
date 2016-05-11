var map, pos, currentPositionMarker, foodName, food, foodLatlng;
var markersArray = [];
var foodInfowindowArray = [];
var Address;

function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

function initMap() {

	var styles = [
    {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -10 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 70 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

  map = new google.maps.Map(document.getElementById('map'), {
    disableDefaultUI: true,
    zoom: 14,
		mapTypeControlOptions: {
    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
	 });

  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lng: position.coords.longitude,
				lat: position.coords.latitude
      };
var	currentPositionMarker = new google.maps.Marker({
    position: pos,
    title:"Уточните свое местоположение перетягиванием маркера",
	   draggable: true,
     icon: {
        url: 'images/location.svg',
        scaledSize: new google.maps.Size(40, 40) // pixels
      }
});
google.maps.event.addListener(currentPositionMarker, 'dragend', function() {
  pos.lat = currentPositionMarker.getPosition().lat();
  pos.lng = currentPositionMarker.getPosition().lng();
  map.setCenter(pos);
   });
currentPositionMarker.setMap(map);
map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
};

function geocodeLatLng(geocoder, map, infowindow) {

    geocoder.geocode({'location': foodLatlng}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        Address = results[0].formatted_address;
      }
         else { Address = 'No results found'; }
    }
    else { Address = 'Geocoder failed due to: ' ; }
    });

}

function getfood(maxdist) {
  var infoWindow = new google.maps.InfoWindow();
  var geocoder = new google.maps.Geocoder;

  var sendData = {};
    sendData.pos = pos;
    sendData.maxdist = maxdist;
    console.log(JSON.stringify(sendData));

    $.get('./foods', sendData, function (data) {
			clearOverlays();
      data.forEach(function(item, i, arr) {
         foodLatlng = new google.maps.LatLng(data[i].location[1].toString(), data[i].location[0].toString());
         geocodeLatLng(geocoder);
         foodName = data[i].name.toString();
         ownerPhone =  JSON.stringify(data[i].owner[0].phone);
         ownerName = JSON.stringify(data[i].owner[0].username);
         foodAddress = Address;
         food = new google.maps.Marker({
              position: foodLatlng,
              title: foodName,
    					map: map
          });


        var popupContent = '<div id="foodContent" style="width: 400px">' +
                            '<div><h2>' + foodName + '</h2></div>' +
                            '<div>' + ' Продавец: '+ ownerName + 'Телефон: '+ ownerPhone +'</div>' +
                            '<div id="foodAddress">' + 'Расположение: ' + foodAddress + '</div>' +
                            '<div><img width="380" src="' + data[i].photoURL.toString() + '" /></div>' +
                            '<div>' + data[i].comment.toString()  + '</div>' +
                            
                        '</div>';

      createInfoWindow(food, popupContent);
			markersArray.push(food);
    });

  });



function createInfoWindow(marker, popupContent) {
        google.maps.event.addListener(food, 'click', function () {
            infoWindow.setContent(popupContent);
            infoWindow.open(map, this);
            map.setCenter(foodLatlng);
  });
}
google.maps.event.addListener(infoWindow, 'domready', function() {
  document.getElementById('foodAddress').innerHTML = Address;
});
};
initMap();
