
    let map;
    let directionsService;
    let forwardRenderer;
    let backwardRenderer;


    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 23.8041, lng: 90.4152}, // Default center (San Francisco)
            zoom: 13,
        });
        directionsService = new google.maps.DirectionsService();
        //directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
        forwardRenderer = new google.maps.DirectionsRenderer({ map: map, polylineOptions: { strokeColor: 'blue' } });
        backwardRenderer = new google.maps.DirectionsRenderer({ map: map, polylineOptions: { strokeColor: 'red' } });
         
        // Set the origin location to the user's current location by default
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
        const currentLocation = new google.maps.LatLng(latitude, longitude);
        
        const geocoder = new google.maps.Geocoder;
        geocoder.geocode({ 'location': currentLocation }, function(results, status) {
            console.log(results,status);
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
        
    }

    function calculateAndDisplayRoute() {
        const originInput = document.getElementById('originInput').value;
        const destinationInput = document.getElementById('destinationInput').value;

        // Forward route (from current location or entered origin to destination)
        calculateRoute(originInput || undefined, destinationInput, forwardRenderer);

        // Backward route (from destination to current location or entered origin)
        calculateRoute(destinationInput, originInput || undefined, backwardRenderer);

        if (!destinationInput) {
            window.alert('Please enter a destination.');
            return;
        }
        
        // Forward route (from current location to destination)
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(
        //         position => {
        //             const { latitude, longitude } = position.coords;
        //             const currentLocation = new google.maps.LatLng(latitude, longitude);
        //             calculateRoute(currentLocation, destinationInput, forwardRenderer);
        //         },
        //         error => {
        //             console.error(error);
        //         }
        //     );
        // }

        // Backward route (from destination to current location)
       // calculateRoute(destinationInput, '', backwardRenderer);


        //const originInput = document.getElementById('originInput').value;
        //const destinationInput = document.getElementById('destinationInput').value;
        //calculateRoute(originInput, destinationInput, forwardRenderer);
        //calculateRoute(destinationInput, originInput, backwardRenderer);
    


    }
    function calculateRoute(origin, destination, renderer){
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: 'DRIVING'
            },
            (response, status) => {
                if (status === 'OK') {
                    renderer.setDirections(response);
                    const route = response.routes[0];
                    const distance = route.legs[0].distance.text;
                    const duration = route.legs[0].duration.text;

                    document.getElementById('distance').textContent = `Distance: ${distance}`;
                    document.getElementById('duration').textContent = `Duration: ${duration}`;
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            }
        );
    }
