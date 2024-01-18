
let map;
let directionsService;
let forwardRenderer;
let backwardRenderer;
let speedDisplay;
let forwardBusMarker;
let backwardBusMarker;
let forwardIntervalId ;
let backwardIntervalId ;


function initMap() {
map = new google.maps.Map(document.getElementById('map'), {
  center: {
      lat: 23.8041,
      lng: 90.4152
   
  }, // Default center (Dhaka, Bangladesh)
  zoom: 13,
});
speedDisplay = document.getElementById('speedDisplay');
watchUserPosition();
directionsService = new google.maps.DirectionsService();

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

const originAutocomplete = new google.maps.places.Autocomplete(document.getElementById('originInput'));
originAutocomplete.bindTo('bounds', map);

const destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destinationInput'));
destinationAutocomplete.bindTo('bounds', map);


originAutocomplete.addListener('place_changed', function () {
    const place = originAutocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }
    map.setCenter(place.geometry.location);
});


destinationAutocomplete.addListener('place_changed', function () {
    const place = destinationAutocomplete.getPlace();
    if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
    }
    map.setCenter(place.geometry.location);
});

//its shows bus icon

forwardBusMarker = new google.maps.Marker({
    position: { lat: 0, lng: 0 },
    map: map,
    icon: {
        url: forwardBusIconUrl,  // URL of the forward bus icon image.
        scaledSize: new google.maps.Size(100, 100)  // Sets the size of the icon.
    }  // URL of the bus icon image.
    
});

backwardBusMarker = new google.maps.Marker({
    position: { lat: 0, lng: 0 },
    map: map,
    icon: {
        url: backwardBusIconUrl,  // URL of the forward bus icon image.
        scaledSize: new google.maps.Size(100, 100)  // Sets the size of the icon.
    }  // URL of the bus icon image.
    
});

// its shows location icon
// forwardBusMarker = new google.maps.Marker({
//     position: { lat: 0, lng: 0 },
//     map: map,
//     url: forwardBusIconUrl,  // URL of the backward bus icon image.
//     scaledSize: new google.maps.Size(50, 50)  // Sets the size of the icon.
// });

// backwardBusMarker = new google.maps.Marker({
//     position: { lat: 0, lng: 0 },
//     map: map,
//     url: backwardBusIconUrl,  // URL of the backward bus icon image.
//     scaledSize: new google.maps.Size(50, 50)  // Sets the size of the icon.
// });


}

//real time speed calculation and display
function watchUserPosition() {
    navigator.geolocation.watchPosition(
      position => {
        // Speed in meters per second
        const speed = position.coords.speed; 

        if (speed !== null && speed !== undefined) {
            
          const speedKmh = (speed * 3.6).toFixed(2); //34.7685656865 km/h 

          
          document.getElementById('speedDisplay').textContent = `${speedKmh} km/h`;

        } else {
          
          document.getElementById('speedDisplay').textContent = `0 km/h`;
        }
      },

      error => {
        console.error(error);
       
        document.getElementById('speedDisplay').textContent = 'Error getting speed information.';
      },

      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }

    );
  }

function calculateAndDisplayRoute() {
    const originInput = document.getElementById('originInput').value;
    const destinationInput = document.getElementById('destinationInput').value;
    const travelMode = document.getElementById('travelModeSelect').value;
    const routeOption = document.querySelector('input[name="routeOption"]:checked').value;

    // Clear both routes
    forwardRenderer.setDirections({ routes: [] });
    backwardRenderer.setDirections({ routes: [] });

    // Stop the bus markers.
    if (forwardIntervalId) {
        clearInterval(forwardIntervalId);
        forwardIntervalId = null;
    }
    if (backwardIntervalId) {
        clearInterval(backwardIntervalId);
        backwardIntervalId = null;
    }

    forwardBusMarker.setVisible(false);
    backwardBusMarker.setVisible(false);

    if (routeOption === 'forward') {
        forwardBusMarker.setVisible(true);
        calculateRoute(originInput || undefined, destinationInput, forwardRenderer, travelMode, true);
        
    } else if (routeOption === 'backward') {
        backwardBusMarker.setVisible(true);
        calculateRoute(destinationInput, originInput || undefined, backwardRenderer, travelMode, false);
       
    } else if (routeOption === 'both') {
        forwardBusMarker.setVisible(true);
        backwardBusMarker.setVisible(true);
        calculateRoute(originInput || undefined, destinationInput, forwardRenderer, travelMode, true);
        calculateRoute(destinationInput, originInput || undefined, backwardRenderer, travelMode, false);

    }

    if (!destinationInput) {
        window.alert('Please enter a destination.');
        return;
    }
    
}
function calculateRoute(origin, destination, renderer, travelMode, isForwardDirection){
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

                document.getElementById('distance').textContent = `${distance}`;
                document.getElementById('duration').textContent = `(${travelMode}): ${duration}`;
                
                // Move the bus marker along the path.
                let path = route.overview_path;

                //single bus movement

                // let pathIndex = 0;
                // let busMarker = isForwardDirection ? forwardBusMarker : backwardBusMarker;
                // busMarker.setPosition(path[pathIndex]);
                // let intervalId = setInterval(() => {
                //     pathIndex++;
                //     if (pathIndex < path.length) {
                //         busMarker.setPosition(path[pathIndex]);
                //     }
                //     else {
                //         // Clear the interval when the bus reaches the end of the path.
                //         clearInterval(intervalId);
                //     }
                // }, 1000);

                //for multiple bus movement
                const busMarkers = [];
                let busesArrived = 0;
                for (let i = 0; i < 3; i++) {  // Create 3 bus markers.
                    const busMarker = new google.maps.Marker({
                        position: path[0],
                        map: map,
                        icon: {
                            url: isForwardDirection ? forwardBusIconUrl : backwardBusIconUrl,
                            scaledSize: new google.maps.Size(50, 50)
                        }
                    });
                    busMarkers.push(busMarker);
                }

                // for (let i = 0; i < busMarkers.length; i++) {
                //     const busMarker = busMarkers[i];
                //     let index = 0;
                //     setTimeout(function() {
                //         setInterval(function() {
                //             busMarker.setPosition(path[index]);
                //             index = (index + 1) % path.length;
                //         }, 1000 * (i + 1));  // Move each bus at a different speed.
                //     }, 5000 * i);  // Start each bus at a different time.
                // }

                // Store the interval IDs.
                let intervalIds = [];
                // Clear the previous intervals.
                for (let i = 0; i < intervalIds.length; i++) {
                        clearInterval(intervalIds[i]);
                    }

                  // Reset the interval IDs array.
                    intervalIds = [];  
                 // multiple bus movement with stop
                for (let i = 0; i < busMarkers.length; i++) {
                    const busMarker = busMarkers[i];
                    let index = 0;
                    // setTimeout(function() {
                        let intervalId = setInterval(function() {
                            busMarker.setPosition(path[index]);
                            index++;
                            if (index >= path.length) {
                                // Clear the interval when the bus reaches the end of the path.
                                clearInterval(intervalId);
                
                                // Increment the number of buses that have arrived.
                                busesArrived++;
                                if (busesArrived === busMarkers.length) {
                                    // Show a message when all buses have arrived.
                                    alert('All buses have arrived at their destination.');
                                    
                                }
                            }
                        }, 1000 * (i + 1));  // Move each bus at a different speed.
                        
                        intervalIds.push(intervalId);

                        if (isForwardDirection) {
                            forwardIntervalId = intervalId;
                        } else {
                            backwardIntervalId = intervalId;
                        }
                    // }, 5000 * i);  // Start each bus at a different time.
                }

                if (isForwardDirection) {
                    forwardIntervalId = intervalId;
                } else {
                    backwardIntervalId = intervalId;
                }
            }
            
            else {
                window.alert('Directions request failed due to ' + status);
            }
        }
    );
}
