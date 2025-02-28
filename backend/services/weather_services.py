from flask import Blueprint, jsonify, request

from exceptions import TableNotFoundError  
from database.databaseManager import DatabaseManager
from database.naturalLangParser import NaturalLangParser


class DatabaseManagerPool:
	"""Simple database manager pool class

    Attributes:
        db_managers (list): databaseManager class instances
    """
	_instance = None

	def __new__(cls):
		"""Method for singleton instance"""
		if cls._instance is None:
			cls._instance = super(DatabaseManagerPool, cls).__new__(cls)
			cls._instance._initialize()
		return cls._instance

	def _initialize(self):
		"""Method for creating singleton instance for each table"""
		self.db_managers = {
			table: DatabaseManager(table) for table in 
					[ "forecast", "history" ]
		}
	
	def get_db_managers(self, table):
		"""Method for returning db manager for table"""
		db_manager = self.db_managers.get(table)
		if not db_manager:
			raise TableNotFoundError(f"Invalid DB Table")
		return db_manager

db_manager_pool = DatabaseManagerPool()

class WeatherService:
	"""The class that actually performs the endpoint API operations"""

	@staticmethod
	def get_table_columns() -> dict:
		"""Method for getting db table columns

		Returns:
			flask.Resoponse: column names
			{
				"columns": ["column_name_1", "column_name_2", ...]
			}
		"""
		dbManager = db_manager_pool.get_db_managers("forecast")
		dbManager.set_query(
			"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
			"WHERE TABLE_NAME='forecast'")
		
		data = dbManager.fetch_all()
		dbManager.clear()

		result = [row[0] for row in data]
		return jsonify({ "columns": result })

	@staticmethod
	def get_column_minmax(args) -> dict:
		"""Method for getting min, max values in each column
		
		Returns:
			flask.Resoponse: Columns and each min max value
				{
					"column_name_1": {
						"min": value,
						"max": value,
						"data_type": "type",
						"is_nullable": "YES" or "NO"
					},
					"column_name_2": {
						"min": value,
						"max": value,
						"data_type": "type",
						"is_nullable": "YES" or "NO"
					},
					...
				}
		"""	
		table = args.get("from")
		dbManager = db_manager_pool.get_db_managers(table)

		return jsonify(dbManager.get_minmax())

	@staticmethod
	def get_query_count(args)-> dict:
		"""Method for getting the number of results of query
		
		Returns:
			flask.Resoponse: Query result count
			{
				"count": integer_value
			}
		"""	
		table = args.get("from")
		columns = args.get("select")
		distinct = args.get("distinct", "false").lower() == "true"
		wheres = args.getlist("where")

		dbManager = db_manager_pool.get_db_managers(table)
		dbManager.count(distinct,
						columns,
						wheres)
		rows = dbManager.fetch_one()
		dbManager.clear()

		count = rows[0] if rows else 0
		return jsonify({ 'count' : count })

	@staticmethod
	def get_items(args) -> dict:
		"""Retrieves query results based on request parameters.

    	Returns:
        	flask.Resoponse: Query results in a JSON format.
				[
					{
						"column_name_1": value1,
						"column_name_2": value2,
						...
					},
					...
				]
    	"""	
		columns = args.get("select")
		distinct = args.get("distinct", "false").lower() == "true"
		table = args.get("from")
		wheres = args.getlist("where") # [ " ", " " ]
		order_by = args.get("orderby")
		desc=args.get("desc", "false").lower() == "true"
		limit = args.get("limit", type=int)

		dbManager = db_manager_pool.get_db_managers(table)
		dbManager.prepare(distinct,
						columns,
						wheres,
						order_by,
						desc,
						limit)
		rows = dbManager.fetch_all()
		dbManager.clear()
		data = []

		def format_query_results(rows, columns):
			return [dict(zip(columns.split(","), row)) for row in rows]
		
		data = format_query_results(rows, columns)
		
		return jsonify(data)

	@staticmethod
	def get_natural_query(data) -> tuple[dict, int]:
		"""Method for implementing sql query from natural language
		
		Returns:
			tuple[flask.Response, int]: SQL Query results and HTTP status code
		"""
		if not data or "query" not in data:
			return jsonify({"error": "Missing query parameter"}), 400
		
		natural_query = data.get("query")
		query = NaturalLangParser(natural_query).parse()

		dbManager = db_manager_pool.get_db_managers(query["table"])

		dbManager.prepare(query["distinct"],
						query["columns"],
						query["conditions"],
						query["order_by"],
						query["desc"],
						query["limit"])

		rows = dbManager.fetch_all()
		dbManager.clear()

		data = []
		columns = query["columns"].split(",") if query["columns"] else []
		for row in rows:
			row_data = dict(zip(columns, row))
			data.append(row_data)

		return jsonify(data), 200
