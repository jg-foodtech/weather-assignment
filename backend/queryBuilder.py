import re

class QueryBuilder:
    def __init__(self, table):
        self.table = table
        self.columns = "*"
        self.conditions = []
        self.order_by = None
        self.desc = False
        self.limit = None

    def select(self, *columns):
        self.columns = ", ".join(columns)
        return self

    def where(self, condition):
        match = re.match(r"([a-zA-Z0-9_]+)([<>=!]+)(.*)", condition)
        column, operator, value = match.groups()

        if not match:
            raise ValueError(f"Invalid condition format: {condition}")
        
        if not isinstance(value, (int, float, bool)):  
            value = f"'{value}'"
        str = f"{column} {operator} {value}"
        
        self.conditions.append(str)
        return self

    def order(self, column, desc=False):
        self.order_by = column
        self.desc = desc
        return self

    def limit_results(self, limit):
        self.limit = limit
        return self

    def build(self):
        sql = f"SELECT {self.columns} FROM {self.table}"
        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)
        if self.order_by:
            sql += f" ORDER BY {self.order_by} {'DESC' if self.desc else 'ASC'}"
        if self.limit:
            sql += f" LIMIT {self.limit}"
        return sql