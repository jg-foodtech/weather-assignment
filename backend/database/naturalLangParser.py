import spacy
import re
from logger import logger

nlp = spacy.load("ko_core_news_sm")

DB_COLUMNS = ["temperature", "precipitation", "snowfall", "datetime", "sigungu", "sido", "dong"]
TABLE_NAMES = ["forecast", "history"]
REGION_NAMES = ["sigungu", "sido", "dong"]
BIGGER = [ "크", "초과", "큰", "이후", "커", "높" , "큽", "많"]
SMALLER = ["미만", "작", "이전", "낮", "적"]
REGION_SUFFIXES = ["도", "시", "군", "구", "동", "읍", "면", "리"]
REMOVE_POSTFIXES = ["의", "에서", "은", "는", "이", "가", "을", "를", "으로"]
COMPARISON_OPERATORS = {
    ">=": ["이상" ],
    "<=": ["이하" ],
    ">": BIGGER,
    "<": SMALLER
}
TABLE_KEYWORDS = ["테이블", "디비", "데이터베이스"]
ORDER_BY_KEYWORDS = {
    "ASC": ["오름차순"],
    "DESC": ["내림차순"]
}
TOP_KEYWORDS = {
    "ASC": ["최저", "최소" ],
    "DESC": [ "최고", "최대" ],
}
PRIORITY_SUB_KEYWORDS = [ "가장", "제일" ]
LIMIT_KEYWORDS = [ "최대", "개" ]
DISTINCT_KEYWORDS = [ "중복" ]

SQL_KEYWORDS = set(DB_COLUMNS + TABLE_NAMES +
                   sum(COMPARISON_OPERATORS.values(), []) +
                   sum(TOP_KEYWORDS.values(), []) +
                   TABLE_KEYWORDS + 
                   PRIORITY_SUB_KEYWORDS +
                   sum(ORDER_BY_KEYWORDS.values(), []) +
                   LIMIT_KEYWORDS)

class NaturalLangParser:
    """Class to Build query from parsing natural language"""

    def __init__(self, naturalQuery):
        self.table = None
        self.distinct = False
        self.unhandled = []
        self.conditions = []
        self.order_by = None
        self.limit = None
        self.latest_column = None
        self.used_tokens = set()
        self.doc = nlp(naturalQuery)
        self.tokens = self.clean_tokens([token.text for token in self.doc])

    def clean_tokens(self, tokens)  -> list[str]:
        """Tokenize for parsing"""
        cleaned_tokens = []
        for i in range(len(tokens)):
            token = tokens[i]
            added = None
            number_match = re.match(r"(\d+)([^\d]*)", token)
            if number_match:
                number_part, text_part = number_match.groups()
                cleaned_tokens.append(number_part)

                for keyword in SQL_KEYWORDS:
                    if text_part and keyword in text_part:
                        cleaned_tokens.append(keyword)
            else:
                for keyword in SQL_KEYWORDS:
                    if keyword in token:
                        cleaned_tokens.append(keyword)
                        added = keyword
                        break
                if added in REGION_NAMES and i + 1 < len(tokens):
                    next_token = tokens[i + 1]
                    matches = re.findall(rf"(.+?)({'|'.join(REGION_SUFFIXES)})", next_token)
                    if matches:
                        match = max(matches, key=len)
                        cleaned_tokens.append(''.join(match))

        return cleaned_tokens
    
    def parse(self) -> dict:
        """Parse tokens to compose query"""
        index = 0
        while index < len(self.tokens):
            token = self.tokens[index]

            if token in TABLE_KEYWORDS: # table (From)
                index = self.parse_table(index)
            elif token in DB_COLUMNS: # select or where parsing (temp가 3 이상, 5 이하)
                index = self.parse_where(index)
            elif any(token in values for values in ORDER_BY_KEYWORDS.values()): # orderby
                desc = next((key for key, values in ORDER_BY_KEYWORDS.items() if token in values), None)
                index = self.parse_orderby(index, desc)
            elif any(token in values for values in TOP_KEYWORDS.values()): # orderby (best, worst case)
                desc = next((key for key, values in TOP_KEYWORDS.items() if token in values), None)
                index = self.parse_orderby(index, desc)
                self.limit = 1
            elif token in PRIORITY_SUB_KEYWORDS: # Find highest, lowest
                if self.tokens[index + 1] in BIGGER:
                    index = self.parse_orderby(index + 1, 'DESC')
                elif self.tokens[index + 1] in SMALLER:
                    index = self.parse_orderby(index + 1, 'ASC')
                else:
                    self.order_by = {"column": self.latest_column, "order": desc}
                    self.limit = 1
                self.used_tokens.update(token)
            elif token in LIMIT_KEYWORDS: #limit
                if index > 0 and self.tokens[index - 1].isdigit():
                    self.limit = int(self.tokens[index - 1])
                    self.used_tokens.update([self.tokens[index - 1], token])
            elif token in DISTINCT_KEYWORDS:
                self.distinct = True

            index += 1

        unprocessed_tokens = [token for token in self.tokens if token not in self.used_tokens]

        return {
            "columns": ",".join(self.unhandled) or ["*"],
            "distinct": self.distinct,
            "table": self.table,
            "conditions": [f"{col}{op}{val}" for col, op, val in self.conditions],
            "order_by": self.order_by["column"] if self.order_by else None,
            "desc": self.order_by["order"] == "DESC" if self.order_by else False,
            "limit": self.limit,
            "unprocessed_tokens": unprocessed_tokens
        }
    
    def parse_where(self, index) -> int:
        """Parse tokens to get where conditions in query"""
        token =self.tokens[index]
        col_name = token
        self.latest_column = col_name

        if not index + 1 < len(self.tokens): 
            self.unhandled.append(col_name)
            return index
        
        def get_comparison_operator(token):
            return next(
                (key for key, values in COMPARISON_OPERATORS.items() if token in values), 
                None
            )
        
        next_token = self.tokens[index + 1]
        if self.tokens[index + 1].isdigit():
            num1 = next_token
            if index + 2 < len(self.tokens):
                op1 = get_comparison_operator(self.tokens[index + 2])
                if op1:
                    if index + 3 < len(self.tokens) and self.tokens[index + 3].isdigit():
                        num2 = self.tokens[index + 3]
                        if index + 4 < len(self.tokens):
                            op2 = get_comparison_operator(self.tokens[index + 4])
                            if op2: 
                                self.conditions.append((col_name, op1, num1))
                                self.conditions.append((col_name, op2, num2))
                                self.used_tokens.update([col_name, num1, self.tokens[index + 2], 
                                                         num2, self.tokens[index + 4]])
                                index += 4
                        else:
                            self.conditions.append((col_name, op1, num1))
                            self.used_tokens.update([col_name, num1, self.tokens[index + 2]])
                            index += 2
                    else:
                        self.conditions.append((col_name, op1, num1))
                        self.used_tokens.update([col_name, num1, self.tokens[index + 2]])
                        index += 2
                else:
                    self.conditions.append((col_name, "=", num1))
                    index += 1
        elif next_token.endswith(tuple(REGION_SUFFIXES)):
            self.conditions.append((col_name, "=", next_token))
            index += 1
        else:
            self.unhandled.append(col_name)

        return index
    

    def parse_table(self, index) -> int:
        """Parse table to get from condition in query"""
        token = self.tokens[index]
        if index > 0 and self.tokens[index - 1] in TABLE_NAMES:
            self.table = self.tokens[index - 1]
            self.used_tokens.update([self.table, token])
        elif index + 1 < len(self.tokens) and self.tokens[index + 1] in TABLE_NAMES:
            self.table = self.tokens[index + 1]
            self.used_tokens.update([self.table, token])
        return index
    
    def parse_orderby(self, index, desc) -> int:
        """Parse orderby to get orderby condition in query"""
        token = self.tokens[index]
        if index + 1 < len(self.tokens) and self.tokens[index + 1] in DB_COLUMNS:
            self.order_by = {"column": self.tokens[index + 1], "order": desc}
            self.used_tokens.update([self.tokens[index + 1], token])
            index += 1
        elif self.unhandled:
            last_element = self.unhandled.pop()
            self.order_by = {"column": last_element, "order": desc}
            self.used_tokens.update([last_element, token])
        else:
            self.order_by = {"column": self.latest_column, "order": desc}
            self.used_tokens.update(token)
        return index
