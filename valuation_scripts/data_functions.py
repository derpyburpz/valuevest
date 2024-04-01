import yfinance as yf
import pandas as pd
import numpy as np
import datetime as dt
import os
import openpyxl
import time
import math
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.holtwinters import SimpleExpSmoothing

def get_first_numeric_value(dfs, sheet_index, row_name):
    df = dfs[sheet_index]
    row_values = df.loc[row_name]
    for value in row_values:
        if isinstance(value, (int, float)) and not np.isnan(value) and value != 0:
            return value
    return None

def get_first_two_numeric_values(dfs, sheet_index, row_name):
    df = dfs[sheet_index]
    row_values = df.loc[row_name]
    numeric_values = [value for value in row_values if isinstance(value, (int, float)) and not np.isnan(value)]
    return numeric_values[0] if len(numeric_values) > 0 else None, numeric_values[1] if len(numeric_values) > 1 else None
