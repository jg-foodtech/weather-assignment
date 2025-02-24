import pymysql
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from queryBuilder import QueryBuilder

app = Flask(__name__)
CORS(app)  # For local

handler = logging.FileHandler('log.log')
handler.setLevel(logging.DEBUG)
app.logger.addHandler(handler)

mydb = pymysql.connect(host="127.0.0.1", 
					   user="jingi", 
					   passwd="123",
					   db="weather_db")


# try:
#     cursor = mydb.cursor()
#     query = """
# 	SELECT id, sido, sigungu, dong, datetime, temperature, precipitation, snowfall
#     FROM weather_data
# 	WHERE datetime >= '2024-12-22:00'
# 	AND temperature <= -18;
# 	"""

#     cursor.execute(query)
#     result = cursor.fetchall()
#     with open("output.txt", "w") as file:
#         for row in result:
#             file.write(" | ".join(map(str, row)) + "\n")
# finally:
#     cursor.close()
#     mydb.close()

# DB에서 고유한 시군구동면읍 추출
#try:
#    with mydb.cursor() as cursor:
#        query = "SELECT DISTINCT sido, sigungu, dong FROM weather_data"
#        cursor.execute(query)
#
#        result = cursor.fetchall()
#
#        with open('distinct_values.txt', mode='w', encoding='utf-8') as file:
#            for row in result:
#                file.write(f"[{', '.join(map(str, row))}]\n")
#
#finally:
#    mydb.close()
    
	
#   query = """
#	SELECT id, sido, sigungu, dong, datetime, temperature, precipitation, snowfall
#    FROM weather_data
#	WHERE datetime >= '2024-12-22:00'
#	AND temperature <= -22;
#	"""

@app.route('/api/items', methods=['GET'])
def get_items():
	cursor = mydb.cursor()
	
	builder = QueryBuilder("weather_data")
	select_columns = request.args.get("select")
	if select_columns:
		builder.select(*select_columns.split(","))

	wheres = request.args.getlist("where")
	for condition in wheres:
		builder.where(condition)

	order_by = request.args.get("orderby")
	if order_by:
		builder.order(order_by, desc=request.args.get("desc", "false").lower() == "true")

	limit = request.args.get("limit", type=int)
	if limit:
		builder.limit_results(limit)

	query = builder.build()


	cursor.execute(query)
	rows = cursor.fetchall()
	columns = [description[0] for description in cursor.description]
	data = []
	for row in rows:
		row_data = dict(zip(columns, row))
		data.append(row_data)


	with open("output2.txt", "w") as file:
		file.write(query)
		file.write("Data: " + str(data) + "\n")
	
	return jsonify(data)

@app.route('/api/hello', methods=['GET'])
def hello():
	return jsonify({"message": "Hello from Flask API!"})

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5000)
