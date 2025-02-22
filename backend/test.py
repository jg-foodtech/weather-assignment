import pymysql
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # For local

handler = logging.FileHandler('app.log')
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
    

## API 엔드포인트
@app.route('/api/items', methods=['GET'])
def get_items():
    cursor = mydb.cursor()
    query = """
	SELECT id, sido, sigungu, dong, datetime, temperature, precipitation, snowfall
    FROM weather_data
	WHERE datetime >= '2024-12-22:00'
	AND temperature <= -22;
	"""
    cursor.execute(query)
    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append({'id': row[0], 'id1': row[1], 'id2': row[2], 'id3': row[3], 'id4': row[4], 'id5': row[5], 'id6': row[6], 'id7': row[7]})
    return jsonify(data)

@app.route('/api/hello', methods=['GET'])
def hello():
	return jsonify({"message": "Hello from Flask API!"})

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5000)
