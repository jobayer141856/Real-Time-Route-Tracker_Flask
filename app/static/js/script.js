
let map;
let directionsService;
let forwardRenderer;
let backwardRenderer;


function initMap() {
map = new google.maps.Map(document.getElementById('map'), {
  center: {
      lat: 23.8041,
      lng: 90.4152
   
  }, // Default center (Dhaka, Bangladesh)
  zoom: 13,
});

console.log(map);
directionsService = new google.maps.DirectionsService();
//directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
forwardRenderer = new google.maps.DirectionsRenderer({
  map: map,
  polylineOptions: {
      strokeColor: 'blue'
  }
});
backwardRenderer = new google.maps.DirectionsRenderer({
  map: map,
  polylineOptions: {
      strokeColor: 'red'
  }
});

// Set the origin location to the user's current location by default
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
      position => {
          const {
              latitude,
              longitude
          } = position.coords;
          const currentLocation = new google.maps.LatLng(latitude, longitude);
          const geocoder = new google.maps.Geocoder;
          geocoder.geocode({
              'location': currentLocation
          }, function(results, status) {
              console.log(results, status);
              if (status === 'OK') {
                  if (results[0]) {
                      document.getElementById('originInput').value = results[0].formatted_address;
                  } else {
                      window.alert('No results found');
                  }
              } else {
                  window.alert('Geocoder failed due to: ' + status);
              }
          });
      },
        error => {
            console.error(error);
        }
  );
}
// Add Autocomplete for Origin and Destination inputs
const originAutocomplete = new google.maps.places.Autocomplete(document.getElementById('originInput'));
originAutocomplete.bindTo('bounds', map);

const destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destinationInput'));
destinationAutocomplete.bindTo('bounds', map);

// Event listener for when a place is selected from autocomplete for the origin field
originAutocomplete.addListener('place_changed', function () {
    const place = originAutocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }
    map.setCenter(place.geometry.location);
});

// Event listener for when a place is selected from autocomplete for the destination field
destinationAutocomplete.addListener('place_changed', function () {
    const place = destinationAutocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }
    map.setCenter(place.geometry.location);
});

}

function calculateAndDisplayRoute() {
    const originInput = document.getElementById('originInput').value;
    const destinationInput = document.getElementById('destinationInput').value;
    const travelMode = document.getElementById('travelModeSelect').value;
    const routeOption = document.querySelector('input[name="routeOption"]:checked').value;
    // Clear both routes
    forwardRenderer.setDirections({ routes: [] });
    backwardRenderer.setDirections({ routes: [] });

    if (routeOption === 'forward') {
        calculateRoute(originInput || undefined, destinationInput, forwardRenderer, travelMode);
    } else if (routeOption === 'backward') {
        calculateRoute(destinationInput, originInput || undefined, backwardRenderer, travelMode);
    } else if (routeOption === 'both') {
        calculateRoute(originInput || undefined, destinationInput, forwardRenderer, travelMode);
        calculateRoute(destinationInput, originInput || undefined, backwardRenderer, travelMode);
    }

    if (!destinationInput) {
        window.alert('Please enter a destination.');
        return;
    }
    
}
function calculateRoute(origin, destination, renderer, travelMode){
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: travelMode,
        },
        (response, status) => {
            if (status === 'OK') {
                renderer.setDirections(response);
                const route = response.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;

                document.getElementById('distance').textContent = `Distance: ${distance}`;
                document.getElementById('duration').textContent = `Duration (${travelMode}): ${duration}`;
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        }
    );
}
