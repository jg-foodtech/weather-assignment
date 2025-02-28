from flask import Flask
from flask_cors import CORS
from blueprints.weather_bp import weather_bp

app = Flask(__name__)
CORS(app)  # For local

app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True

app.register_blueprint(weather_bp, url_prefix='/api/weather')

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5000)
