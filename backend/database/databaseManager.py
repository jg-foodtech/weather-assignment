import pymysql
import re
from logger import logger
from exceptions import InvalidQueryError

class QueryBuilder:
    """Class to build query from data that comes from user"""

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

        self.conditions.append(f"{column} {operator} {value}")
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
        
        logger.debug(sql)
        return sql
    
    def count(self):
        select = "DISTINCT " + self.columns if self.distinct else "*"
        sql = f"SELECT COUNT({select}) FROM {self.table}"

        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)

        logger.debug(sql)
        return sql
    
    def clear(self):
        return

class DatabaseManager:
    """Manager class who executes query and return the results"""

    def __init__(self, table):
        self.conn = pymysql.connect(host="127.0.0.1", 
     		        			    user="jingi", 
                                    passwd="123",
                                    db="weather_db")
        self.query = None
        self.queryBuilder = None
        self.table = table
        self.cursor = self.conn.cursor()
        self.minmax_cache = None
        self.set_minmax()

    def set_minmax(self):
        """Save cache of min, max, column values"""
        if self.minmax_cache is not None:
            return
        
        self.set_query(
            f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE "
            f"FROM INFORMATION_SCHEMA.COLUMNS "
            f"WHERE TABLE_NAME='{self.table}'"
        )
        columns = self.fetch_all()
        minmax_data = {}
        
        for column in columns:
            column_name = column[0]
            data_type = column[1]
            is_nullable = column[2]
            self.set_query(
                f"SELECT MIN({column_name}) AS min, MAX({column_name}) "
                f"AS max FROM {self.table}")
            data = self.fetch_one()
            min_val, max_val = data
            minmax_data[column_name] = {
                'min': min_val,
                'max': max_val,
                'data_type': data_type,
                'is_nullable': is_nullable
            }
        self.minmax_cache = minmax_data

    def get_minmax(self):
        return self.minmax_cache

    def get_columns(self):
        self.queryBuilder.build()
        data = self.cursor.execute(
            f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
            f"WHERE TABLE_NAME = {self.table}")
        data = self.cursor.fetchall()
        self.cursor.close()
        return data
            
    def set_query(self, query):
        self.query = query
        try:
            self.cursor.execute(f"EXPLAIN {self.query}")
        except pymysql.MySQLError as e:
            logger.error(f"Invalid query: {e}")
            raise InvalidQueryError(f"Query query: {str(e)}")

    def prepare(self, distinct, columns, wheres, order_by, desc, limit):
        """Prepare sql query before requesting to database"""
        self.queryBuilder = QueryBuilder(self.table)
        if columns:
            self.queryBuilder.select(*columns.split(","), distinct=distinct)
        
        for condition in wheres:
            self.queryBuilder.where(condition)

        if order_by:
            self.queryBuilder.order(order_by, desc)

        if limit:
            self.queryBuilder.limit_results(limit)

        sql = self.queryBuilder.build()
        self.set_query(sql)

    def count(self, distinct, columns, wheres):
        """Prepare sql query for counting result before requesting to database"""
        self.queryBuilder = QueryBuilder(self.table)
        if columns:
            self.queryBuilder.select(*columns.split(","), distinct=distinct)
        for condition in wheres:
            self.queryBuilder.where(condition)

        sql = self.queryBuilder.count()
        self.set_query(sql)

    def fetch_all(self):
        self.cursor.execute(self.query)
        return self.cursor.fetchall()
    
    def fetch_one(self):
        self.cursor.execute(self.query)
        return self.cursor.fetchone()
    
    def clear(self):
        self.queryBuilder = None
