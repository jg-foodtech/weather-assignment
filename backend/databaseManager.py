import pymysql
import re
import logging
from logger import logger

class QueryBuilder:
    def __init__(self, table):
        self.table = table
        self.columns = "*"
        self.conditions = []
        self.distinct = False
        self.order_by = None
        self.desc = False
        self.limit = None

    def select(self, *columns, distinct=False):
        self.columns = ", ".join(columns)
        self.distinct = distinct
        return self

    def where(self, condition):
        match = re.match(r"([a-zA-Z0-9_]+)([<>=!]+)(.*)", condition)
        
        if not match:
            raise ValueError(f"Invalid condition format: {condition}")
        column, operator, value = match.groups()
        
        if not isinstance(value, (int, float, bool)):
            value = value if isinstance(value, str) and value.isdigit() else f"'{value}'"
        ret = f"{column} {operator} {value}"
        
        self.conditions.append(ret)
        return self

    def order(self, column, desc=False):
        self.order_by = column
        self.desc = desc
        return self

    def limit_results(self, limit):
        self.limit = limit
        return self

    def build(self):
        sql = f"SELECT"
        if self.distinct:
            sql += f" DISTINCT"

        sql += f" {self.columns} FROM {self.table}"
        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)
        if self.order_by:
            sql += f" ORDER BY {self.order_by} {'DESC' if self.desc else 'ASC'}"
        if self.limit:
            sql += f" LIMIT {self.limit}"
        
        with open("output2.txt", "w") as file:
             file.write(sql)
        logger.debug(sql)
        return sql
    
    def count(self):
        select = "*"
        if self.distinct:
            select = f"DISTINCT {self.columns}"
        sql = f"SELECT COUNT({select}) FROM {self.table}"

        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)

        logging.debug(sql)
        return sql
    
    def clear(self):
        return

class DatabaseManager:
    # FIXME: Group arguments. Is it write to get table in constructor?
    def __init__(self, name):
        self.conn = pymysql.connect(host="127.0.0.1", 
     		        			    user="jingi", 
                                    passwd="123",
                                    db="weather_db") # FIXME
        self.query = None
        self.queryBuilder = None
        self.table = name
        self.cursor = self.conn.cursor()
        
    def get_columns(self):
        self.queryBuilder.build()
        data = self.cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = {self.table}")
        data = self.cursor.fetchall()
        self.cursor.close()
        return data;

    def prepare(self, distinct, columns, wheres, order_by, desc, limit):
        self.queryBuilder = QueryBuilder(self.table)
        if columns:
            logging.debug("debug loggg = %s", columns)
            self.queryBuilder.select(*columns.split(","), distinct=distinct)
        
        for condition in wheres:
            self.queryBuilder.where(condition)

        if order_by:
            self.queryBuilder.order(order_by, desc)

        if limit:
            self.queryBuilder.limit_results(limit)

        self.set_query(self.queryBuilder.build())
        with open("output2.txt", "w") as file:
            file.write(self.query)

    def count(self, distinct, columns, wheres):
        self.queryBuilder = QueryBuilder(self.table)
        if columns:
            self.queryBuilder.select(*columns.split(","), distinct=distinct)
        for condition in wheres:
            self.queryBuilder.where(condition)
        self.set_query(self.queryBuilder.count())

    def set_query(self, query):
        self.query = query

    def fetch_all(self):
        self.cursor.execute(self.query)
        data = self.cursor.fetchall()
        return data
    
    def fetch_one(self):
        cursor = self.cursor
        cursor.execute(self.query)
        data = cursor.fetchone()

        data_str = "\n".join([str(row) for row in data])
        with open("output2.txt", "a") as file:
            file.write(data_str + "\n")
        return data
    
    def clear(self):
        self.queryBuilder = None
        self.cursor.close()
        return
