from flask import Flask, render_template
import random  # For simulating real-time data
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get-real-time-data')
def get_real_time_data():
    # Simulated real-time data
    time_to_arrival = random.randint(1, 60)  # Random time in minutes
    speed = random.randint(20, 60)  # Random speed in km/h
    next_stop_distance = random.randint(1, 10)  # Random distance in km

    return {
        'timeToArrival': f'{time_to_arrival} minutes',
        'speed': f'{speed} km/h',
        'nextStopDistance': f'{next_stop_distance} km'
    }

if __name__ == '__main__':
    app.run(debug=True)
