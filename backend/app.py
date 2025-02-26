from logger import logger
from flask import Flask, jsonify, request
from flask_cors import CORS
from databaseManager import DatabaseManager
from naturalLangParser import NaturalLangParser
import json


app = Flask(__name__)
CORS(app)  # For local

TABLES = ["weather_data" ] #"forecast", "history"]

DBManagers = {table: DatabaseManager(table) for table in TABLES}


def temp():
	table_name = "weather_data"
	dbManager = DBManagers[table_name]
	dbManager.set_query(f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='{table_name}'")
	columns = dbManager.fetch_all()
	minmax_data = {}
	
	for column in columns:
		column_name = column[0]
		data_type = column[1]
		is_nullable = column[2]
		dbManager.set_query(f"SELECT MIN({column_name}) AS min, MAX({column_name}) AS max FROM {table_name}")
		data = dbManager.fetch_one()
		min_val, max_val = data
		minmax_data[column_name] = {
	 		'min': min_val,
	 		'max': max_val,
	 		'data_type': data_type,
	 		'is_nullable': is_nullable
	 	}
	logger.debug('minmax finished')

	return minmax_data
temp_cache = temp()

# Suppose that forecast and history have same column
@app.route('/api/weather/columns', methods=['GET'])
def get_table_columns():
	dbManager = DatabaseManager()
	dbManager.set_query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=weather_data")
	data = dbManager.fetch_all()

	result = [{"COLUMN_NAME": row[0]} for row in data]

	return {"columns": result}

@app.route('/api/weather/natural', methods=['POST'])
def get_natural_query():
	logger.debug('natural in')
	data = request.get_json()
	natural_query = data.get("query")
	query = NaturalLangParser(natural_query).parse()

	dbManager = DBManagers[query["table"]]

	dbManager.prepare(query["distinct"],
					  query["columns"],
					  query["conditions"],
					  query["order_by"],
					  query["desc"],
					  query["limit"])

	rows = dbManager.fetch_all()
	data = []
	columns = query["columns"].split(",")
	for row in rows:
		row_data = dict(zip(columns, row))
		data.append(row_data)

	app.logger.debug('natural finished')
	dbManager.clear()

	return jsonify(data), 200

@app.route('/api/weather/minmax', methods=['GET'])
def get_column_minmax():
	return jsonify(temp_cache)

@app.route('/api/weather/explain', methods=['GET'])
def get_estimation():
	app.logger.debug('explain in')
	table = request.args.get("from")
	columns = request.args.get("select")
	distinct = request.args.get("distinct", "false").lower() == "true"
	wheres = request.args.getlist("where")

	dbManager = DBManagers[table]
	dbManager.count(distinct,
		   			columns,
					wheres)
	logger.debug(dbManager.query)
	rows = dbManager.fetch_one()

	count = rows[0] if rows else 0
	logger.debug(count)

	return jsonify({ 'count' : count })

@app.route('/api/weather/items', methods=['GET'])
def get_items():
	app.logger.debug('items in')
	columns = request.args.get("select")
	distinct = request.args.get("distinct", "false").lower() == "true"
	table = request.args.get("from")
	wheres = request.args.getlist("where") # [ " ", " " ]
	order_by = request.args.get("orderby")
	desc=request.args.get("desc", "false").lower() == "true"
	limit = request.args.get("limit", type=int)

	dbManager = DBManagers[table]
	dbManager.prepare(distinct,
		   			  columns,
					  wheres,
					  order_by,
					  desc,
					  limit)

	rows = dbManager.fetch_all()
	data = []
	columns = columns.split(",")
	for row in rows:
		row_data = dict(zip(columns, row))
		data.append(row_data)

	app.logger.debug('items finished')

	return jsonify(data)

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5000)
