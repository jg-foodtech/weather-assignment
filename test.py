import pymysql

mydb = pymysql.connect(
    host="127.0.0.1",
    user="jingi",
    passwd="123",
    db="weather_db"
)

try:
	cursor = mydb.cursor()
	query = """
	SELECT id, sido, sigungu, dong, datetime, temperature, precipitation, snowfall
    FROM weather_data
	WHERE datetime >= '2024-12-22:00'
	AND temperature <= -18;
	"""

	cursor.execute(query)
	result = cursor.fetchall()
	with open("output.txt", "w") as file:
		for row in result:
			file.write(" | ".join(map(str, row)) + "\n")
finally:
	cursor.close()
	mydb.close()
