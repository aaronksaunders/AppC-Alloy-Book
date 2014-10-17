/* callback function for getCurrentLocation */
var locationCallback = null;

/**
 *
 * @param {Object} _lat
 * @param {Object} _lng
 * @param {Object} _callback
 */
function reverseGeocoder(_lat, _lng, _callback) {
  var title;

  Ti.Geolocation.purpose = "Wiley Alloy App Demo";

  // callback method converting lat lng into a location/address
  Ti.Geolocation.reverseGeocoder(_lat, _lng, function(_data) {
    if (_data.success) {

      Ti.API.debug("reverseGeocoder " + JSON.stringify(_data, null, 2));

      var place = _data.places[0];
      if (place.city === "") {
        title = place.address;
      } else {
        title = place.street + " " + place.city;
      }
    } else {
      title = "No Address Found: " + _lat + ", " + _lng;
    }
    _callback(title);
  });
}

/**
 *
 * @param {Object} _location
 */
function locationCallbackHandler(_location) {

  // later on when you no longer want to listen;
  Ti.Geolocation.removeEventListener('location', locationCallbackHandler);

  if (!_location.error && _location && _location.coords) {

    var lat, lng;
    Ti.API.debug("locationCallback " + JSON.stringify(_location, null, 2));

    lat = _location.coords.latitude;
    lng = _location.coords.longitude;

    reverseGeocoder(lat, lng, function(_title) {
      locationCallback({
        coords : _location.coords,
        title : _title
      }, null);
      locationCallback = null;
    });
  } else {
    alert('Location Services Error: ' + _location.error);
    locationCallback(null, _location.error);
  }
}

/**
 *
 * @param {Object} _callback
 */
exports.getCurrentLocation = function(_callback) {

  if (!Ti.Geolocation.getLocationServicesEnabled()) {
    alert('Location Services are not enabled');
    _callback(null, 'Location Services are not enabled');
    return;
  }

  // save in global for use in locationCallbackHandler
  locationCallback = _callback;

  Ti.Geolocation.purpose = "Wiley Alloy App Demo";
  Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
  Ti.Geolocation.distanceFilter = 10;
  Ti.Geolocation.addEventListener('location', locationCallbackHandler);
};



exports.calculateMapRegion = function(_annotations) {
    var latMax, latMin, lngMax, lngMin;

    for (var c = 0; c < _annotations.length; c++) {

        var latitude = _annotations[c].latitude;
        var longitude = _annotations[c].longitude;

        latMax = Math.max(latMax || latitude, latitude);
        latMin = Math.min(latMin || latitude, latitude);

        lngMax = Math.max(lngMax || longitude, longitude);
        lngMin = Math.min(lngMin || longitude, longitude);

    }

    //create the map boundary area values
    var bndLat = (latMax + latMin) / 2;
    var bndLng = (lngMax + lngMin) / 2;

    var bndLatDelta = latMax - latMin + 0.01;
    var bndLngDelta = lngMax - lngMin + 0.01;

    //create the map region definition for the boundaries containing the sites
    return mapRegionSites = {
        latitude : bndLat,
        longitude : bndLng,
        animate : true,
        latitudeDelta : bndLatDelta,
        longitudeDelta : bndLngDelta
    };
};
