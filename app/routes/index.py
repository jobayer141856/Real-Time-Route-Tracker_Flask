import random
import requests
from app import*

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/calculate', methods=['POST'])
# def calculate():
#     origin = request.form['origin']
#     destination = request.form['destination']
#     api_key = 'YOUR_GOOGLE_MAPS_API_KEY'

#     # Construct the Directions API request URL
#     url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={api_key}'

#     # Fetch data from the Directions API
#     response = requests.get(url)
#     data = response.json()

#     # Extract distance and duration from the response
#     if data['status'] == 'OK':
#         distance = data['routes'][0]['legs'][0]['distance']['text']
#         duration = data['routes'][0]['legs'][0]['duration']['text']
#     else:
#         distance = 'N/A'
#         duration = 'N/A'

#     return render_template('index.html', distance=distance, duration=duration)

@app.route('/calculate_route', methods=['POST'])
def calculate_route():
    origin = request.form['origin']
    destination = request.form['destination']
    api_key = 'YOUR_GOOGLE_MAPS_API_KEY'

    # Construct the Directions API request URL
    url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={api_key}'

    # Fetch data from the Directions API
    response = requests.get(url)
    data = response.json()

    # Extract route details from the response
    if data['status'] == 'OK':
        route = data['routes'][0]['overview_polyline']['points']
        distance = data['routes'][0]['legs'][0]['distance']['text']
        duration = data['routes'][0]['legs'][0]['duration']['text']
    else:
        route = None
        distance = 'N/A'
        duration = 'N/A'

    return jsonify({'route': route, 'distance': distance, 'duration': duration})

# @app.route('/get-real-time-data')
# def get_real_time_data():
#     # Simulated real-time data
#     time_to_arrival = random.randint(1, 60)  # Random time in minutes
#     speed = random.randint(20, 60)  # Random speed in km/h
#     next_stop_distance = random.randint(1, 10)  # Random distance in km

#     return {
#         'timeToArrival': f'{time_to_arrival} minutes',
#         'speed': f'{speed} km/h',
#         'nextStopDistance': f'{next_stop_distance} km'
#     }

