from flask import Flask, render_template
from app import*
# Replace 'YOUR_MAP_API_KEY' with your actual map API key
MAP_API_KEY = 'AIzaSyDu4Yq2QEuR0y_20-eYwu6jJmC_DRwHDaw'

@app.route('/')
def index():
    print(MAP_API_KEY)
    return render_template('index.html', map_api_key=MAP_API_KEY )

