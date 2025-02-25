import pymysql
import re
import logging

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
        return sql
    
    def explain(self):
        sql = f"SELECT COUNT(*) FROM {self.table}"

        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)

        logging.debug(sql)
        return sql
    
    def clear(self):
        return

class DatabaseManager:
    # FIXME: Group arguments. Is it write to get table in constructor?
    def __init__(self):
        self.conn = pymysql.connect(host="127.0.0.1", 
     		        			    user="jingi", 
                                    passwd="123",
                                    db="weather_db") # FIXME
        self.query = None
        self.queryBuilder = None    
        self.cursor = self.conn.cursor()
        
    def get_columns(self, table):
        self.queryBuilder.build()
        data = self.cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = {table}")
        data = self.cursor.fetchall()
        self.cursor.close()
        return data;

    def prepare(self, table, distinct, columns, wheres, order_by, desc, limit):
        self.queryBuilder = QueryBuilder(table)
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

    def explain(self, table, wheres):
        self.queryBuilder = QueryBuilder(table)
        for condition in wheres:
            self.queryBuilder.where(condition)
        self.set_query(self.queryBuilder.explain())

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
