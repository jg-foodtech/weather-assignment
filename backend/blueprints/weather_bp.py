from flask import Blueprint, jsonify, request
from exceptions import TableNotFoundError, InvalidQueryError
from services.weather_services import WeatherService
from logger import logger

weather_bp = Blueprint('weather', __name__)

@weather_bp.errorhandler(TableNotFoundError)
def handle_table_error(error):
    return jsonify({"error": f"Invalid table: {str(error)}"}), 400

@weather_bp.errorhandler(InvalidQueryError)
def handle_query_error(error):
    return jsonify({"error": str(error)}), 400

@weather_bp.errorhandler(Exception)
def handle_generic_error(error):
    return jsonify({"error": str(error)}), 500

@weather_bp.route('/columns', methods=['GET'])
def get_table_columns():
    return WeatherService.get_table_columns()

@weather_bp.route('/minmax', methods=['GET'])
def get_column_minmax():
    return WeatherService.get_column_minmax(request.args)

@weather_bp.route('/count', methods=['GET'])
def get_query_count():
    return WeatherService.get_query_count(request.args)

@weather_bp.route('/items', methods=['GET'])
def get_items():
    return WeatherService.get_items(request.args)

@weather_bp.route('/natural', methods=['POST'])
def get_natural_query():
    data = request.get_json()
    return WeatherService.get_natural_query(data)
