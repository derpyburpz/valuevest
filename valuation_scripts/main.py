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

from dcf import dcf
from erm import erm
from data_functions import get_first_numeric_value, get_first_two_numeric_values

### DEFINITIONS & ASSUMPTIONS ###
NUMBER_OF_YEARS = 10                    # Default historical number of years and DCF projection period
STABLE_GROWTH_RATE = 4.3/100            # Default stable growth rate for ERM based on US 10 year treasury bond rate

revenue_growth_threshold = 0.2          # Threshold for revenue growth rate
reinvestment_rate_threshold = 0.5       # Threshold for reinvestment rate

path = 'C:\\Users\\jakec\\OneDrive - Nanyang Technological University\\Work\\Year 4\\Final Year Project\\FINAL Report\\stockanalysis_all\\'
ind_fin_const = pd.read_excel('C:\\Users\\jakec\\OneDrive - Nanyang Technological University\\Work\\Year 4\\Final Year Project\\\
                              FINAL Report\\ind_fin_const.xls', sheet_name=0)

# Iterate over every row in the ind_fin_const DataFrame
for exchange_ticker in ind_fin_const['Exchange:Ticker']:

    ### DEFINITIONS & ASSUMPTIONS ###
    DCF_GROWTH_RATE = 4.3/100      # Default growth rate for DCF based on US 10 year treasury bond rate
    HIGH_GROWTH_PERIOD = 5          # Default high growth period in years for ERM applied to mature financial firms
    STABLE_GROWTH_PERIOD = 10       # Default stable growth period in years for ERM applied to mature financial firms

    print(f"Processing the following ticker: {exchange_ticker}.")
    time.sleep(0.1)

    processed_symbols = set(line.strip() for line in open('processed.log'))
    missing_data_symbols = set(line.split(' ')[4] for line in open('missing_data.log'))
    try:
        symbol = exchange_ticker.split(':')[1].strip().upper()
        file_symbol = exchange_ticker.split(':')[1].strip().lower()
        ind_fin_const['Industry Group'] = ind_fin_const['Industry Group'].str.strip()        
    except Exception as e:
        print(f"Problem assigning symbols or industry group due to: {e}. Skipping to next symbol.")
        continue
    
    filename = f"{file_symbol}-financials.xlsx"
    filepath = os.path.join(path, filename)

    fin_firm = False
    average_revenue_growth = None
    reinvestment_rate = None

    if symbol in processed_symbols or symbol in missing_data_symbols:
            print(f"{symbol} has already been processed or has missing data. Skipping to next symbol.")
            continue
    else:
        if os.path.exists(filepath):
            xlsx = pd.ExcelFile(filepath)
            dfs = [pd.read_excel(xlsx, sheet_name=sheet, index_col=0) for sheet in xlsx.sheet_names]
            print(f"Financial excel located, processing stock file: {filename}...")
        else:
            print('No financial excel located, assigning None to xlsx and dfs...')
            xlsx = None
            dfs = None

        try:
            print(f"Processing the following symbol: {symbol}.")
            print(f'Exchangeticker is : {exchange_ticker}.')
            try:
                stock = yf.Ticker(symbol)
                balance_sheet = stock.balance_sheet
                income_stmt = stock.income_stmt
                cash_flow = stock.cashflow
                financials = stock.financials.transpose()
                financials_sorted = financials.sort_index(ascending=False)
            except Exception as e:
                print(f"Stock not found for {symbol} from yfinance. Attempting to process with local data...")

            try:
                stock_price = stock.info['previousClose']
                time.sleep(0.1)
            except Exception as e:
                print(f"Stock price not found for {symbol} from yfinance.")
                stock_price = None

            row = ind_fin_const[ind_fin_const['Exchange:Ticker'] == exchange_ticker]

            if 'Cost Of Equity' in row.columns:
                COST_OF_EQUITY = row['Cost Of Equity'].values[0]
                print(f"The cost of equity is {COST_OF_EQUITY}")
            else:
                print(f"No Cost of Equity found for {symbol}. Skipping to next file.")      # Cost of Equity is required for both DCF and ERM
                with open('missing_data.log', 'a') as f:
                    f.write('Neither model applies for ' + symbol + 'due to missing COE' + '\n')
                continue

            if 'Return On Equity' in row.columns:
                STABLE_ROE = row['Return On Equity'].values[0]      # Stable Return on Equity is required for ERM
                print(f"The stable ROE is {STABLE_ROE}")
                financial_firms = ['Bank (Money Center)', 'Banks (Regional)', 'Brokerage & Investment Banking', 'Financial Svcs. (Non-bank & Insurance)', 'Insurance (General)', 'Insurance (Life)', 'Insurance (Prop/Cas.)', 'Investments & Asset Management', 'R.E.I.T.']
                if row['Industry Group'].values[0] in financial_firms:
                    fin_firm = True
                    print(f"The company is a financial firm.")



            ### Determining Company Stage For Non-Financial Firms ###
            print('Determining company stage...')
            try:
                # Revenue Growth Rate
                if os.path.exists(filepath):
                    df = pd.read_excel(xlsx, sheet_name=0, index_col=0)
                    if df.shape[1] > 6:  # Check if there are more than 6 columns
                        revenue_growth = df.loc['Revenue Growth'][:5]
                        revenue_growth = pd.to_numeric(revenue_growth, errors='coerce')
                    else:
                        print("DataFrame has less than 7 columns")
                        revenue_growth = df.loc['Revenue Growth']
                    
                    average_revenue_growth = revenue_growth.mean()     
                else:
                    try:
                        past_revenues = income_stmt.loc['Total Revenue'][::-1] / 1000000
                        past_revenues_df = past_revenues.to_frame().sort_index()
                        past_revenues_df['Growth'] = past_revenues_df['Total Revenue'].pct_change()
                        average_revenue_growth = past_revenues_df['Growth'].mean()
                    except Exception as e:
                        print("No numerical values found in Total Revenue, error traced to: ", str(e))
                        raise Exception("No numerical values found in Total Revenue")

                if average_revenue_growth is None or math.isnan(average_revenue_growth) or average_revenue_growth == 0:
                    raise Exception("No numerical values found in Revenue Growth")


                # Reinvestment Rate
                capex = None
                try:
                    capex = cash_flow.at['Capital Expenditure', cash_flow.columns[0]] / 1000000
                    time.sleep(0.1)
                except Exception as e:
                    if os.path.exists(filepath):
                        capex = get_first_numeric_value(dfs, 2, 'Capital Expenditures')
                        if capex is None:
                            raise Exception("No numerical values found in Capex")
                    else:
                        raise Exception("No numerical values found in Capex")
                
                if capex is not None and not math.isnan(capex) and capex != 0:
                    capex = -capex
                else:
                    raise Exception("No numerical values found in Capex")

                ebit = None
                try:
                    ebit = income_stmt.at['EBIT', income_stmt.columns[0]] / 1000000
                    time.sleep(0.1)
                except Exception as e:
                    if os.path.exists(filepath):
                            ebit = get_first_numeric_value(dfs, 8, 'EBIT')
                    else:
                        raise Exception("No numerical values found in EBIT")
                    
                if ebit is None or math.isnan(ebit) or ebit == 0:
                    raise Exception("No numerical values found in EBIT")
                
                tax_rate = None
                try:
                    tax_rate = financials_sorted['Tax Rate For Calcs'].iloc[0]
                    time.sleep(0.1)
                    if tax_rate == 0 or math.isnan(tax_rate) or tax_rate is None:
                        raise Exception("Missing tax rate data")
                except Exception as e:
                    try:            
                        tax_provision = income_stmt.at['Tax Provision', income_stmt[0]] / 1000000       # Income Tax Expense
                        time.sleep(0.1)
                        pretax_income = income_stmt.at['Pretax Income', income_stmt[0]] / 1000000
                        time.sleep(0.1)
                        if (tax_provision is not None and not math.isnan(tax_provision)) and (pretax_income is not None and not math.isnan(pretax_income)) and (pretax_income != 0 and tax_provision != 0):
                            tax_rate = tax_provision / pretax_income
                        else:
                            raise Exception("Missing tax rate data")
                    except Exception as e:
                        if os.path.exists(filepath): 
                            tax_rate = get_first_numeric_value(dfs, 0, 'Effective Tax Rate')
                        else:
                            raise Exception("Missing tax rate data")
                
                if tax_rate is None or math.isnan(tax_rate) or tax_rate == 0:
                    raise Exception("Missing tax rate")

                nopat = ebit * (1 - tax_rate)
                
                current_assets = None
                prev_current_assets = None
                try:
                    current_assets = balance_sheet.at['Current Assets', balance_sheet.columns[0]] / 1000000
                    time.sleep(0.1)
                    prev_current_assets = balance_sheet.at['Current Assets', balance_sheet.columns[1]] / 1000000
                    time.sleep(0.1)
                except Exception as e:
                    if os.path.exists(filepath):
                        current_assets, prev_current_assets = get_first_two_numeric_values(dfs, 1, 'Total Current Assets')
                        if current_assets is None or current_assets == 0 or prev_current_assets is None or prev_current_assets == 0:
                            cash_and_equivalents, prev_cash_and_equivalents = get_first_two_numeric_values(dfs, 1, 'Cash & Equivalents')
                            cash_and_equivalents = 0 if cash_and_equivalents is None else cash_and_equivalents
                            prev_cash_and_equivalents = 0 if prev_cash_and_equivalents is None else prev_cash_and_equivalents

                            receivables, prev_receivables = get_first_two_numeric_values(dfs, 1, 'Receivables')
                            receivables = 0 if receivables is None else receivables
                            prev_receivables = 0 if prev_receivables is None else prev_receivables

                            inventory, prev_inventory = get_first_two_numeric_values(dfs, 1, 'Inventory')
                            inventory = 0 if inventory is None else inventory
                            prev_inventory = 0 if prev_inventory is None else prev_inventory

                            other_current_assets, prev_other_current_assets = get_first_two_numeric_values(dfs, 1, 'Other Current Assets')
                            other_current_assets = 0 if other_current_assets is None else other_current_assets
                            prev_other_current_assets = 0 if prev_other_current_assets is None else prev_other_current_assets

                            current_assets = cash_and_equivalents + receivables + inventory + other_current_assets
                            prev_current_assets = prev_cash_and_equivalents + prev_receivables + prev_inventory + prev_other_current_assets
                    else:
                        raise Exception("No numerical values found in Current Assets")
                
                if (current_assets is None) or (prev_current_assets is None):
                    raise Exception("No numerical values found in Current Assets")

                current_liabilities = None
                prev_current_liabilities = None    
                try:
                    current_liabilities = balance_sheet.at['Current Liabilities', balance_sheet.columns[0]] / 1000000
                    time.sleep(0.1)
                    prev_current_liabilities = balance_sheet.at['Current Liabilities', balance_sheet.columns[1]] / 1000000
                    time.sleep(0.1)
                except Exception as e:
                    if os.path.exists(filepath):
                        current_liabilities, prev_current_liabilities = get_first_two_numeric_values(dfs, 1, 'Total Current Liabilities')
                        if current_liabilities is None or current_liabilities == 0 or prev_current_liabilities is None or prev_current_liabilities == 0:
                            accounts_payable, prev_accounts_payable = get_first_two_numeric_values(dfs, 1, 'Accounts Payable')
                            accounts_payable = 0 if accounts_payable is None else accounts_payable
                            prev_accounts_payable = 0 if prev_accounts_payable is None else prev_accounts_payable

                            deferred_revenue, prev_deferred_revenue = get_first_two_numeric_values(dfs, 1, 'Deferred Revenue')
                            deferred_revenue = 0 if deferred_revenue is None else deferred_revenue
                            prev_deferred_revenue = 0 if prev_deferred_revenue is None else prev_deferred_revenue

                            current_debt, prev_current_debt = get_first_two_numeric_values(dfs, 1, 'Current Debt')
                            current_debt = 0 if current_debt is None else current_debt
                            prev_current_debt = 0 if prev_current_debt is None else prev_current_debt

                            other_current_liabilities, prev_other_current_liabilities = get_first_two_numeric_values(dfs, 1, 'Other Current Liabilities')
                            other_current_liabilities = 0 if other_current_liabilities is None else other_current_liabilities
                            prev_other_current_liabilities = 0 if prev_other_current_liabilities is None else prev_other_current_liabilities

                            current_liabilities = accounts_payable + deferred_revenue + current_debt + other_current_liabilities
                            prev_current_liabilities = prev_accounts_payable + prev_deferred_revenue + prev_current_debt + prev_other_current_liabilities
                    else:
                        raise Exception("No numerical values found in Current Liabilities")
                
                if (current_liabilities is None) or (prev_current_liabilities is None):
                    raise Exception("No numerical values found in Current Liabilities")

                net_working_capital_diff = current_assets - current_liabilities - prev_current_assets + prev_current_liabilities

                reinvestment_rate = (capex + net_working_capital_diff) / nopat
                print('Company stage determination successful.')
                print(f"The average revenue growth is {average_revenue_growth}.")
                print(f"The reinvestment rate is {reinvestment_rate}.")

            except Exception as e:
                print(f"Growth stage determination not possible due to: {str(e)}\n.")

            print(f'Financial Firm Status: {fin_firm}.')
            print(f"Begin model determination for {symbol}.")




            ### Determining model based on company stage and type ###
            if fin_firm:
                # Is a financial firm, determine whether the company is in the growth stage or mature stage  
                if (average_revenue_growth is not None and average_revenue_growth <= revenue_growth_threshold) and (reinvestment_rate is not None and reinvestment_rate <= reinvestment_rate_threshold):
                    try:
                        print("The company is a financial firm in the mature stage, applying the ERM for mature firms...")
                        HIGH_GROWTH_PERIOD = 1
                        STABLE_GROWTH_PERIOD = 14
                        erm(symbol, stock_price, balance_sheet, income_stmt, xlsx, dfs, COST_OF_EQUITY, STABLE_ROE, HIGH_GROWTH_PERIOD, STABLE_GROWTH_PERIOD)
                        continue                  
                    except Exception as e:
                        print(f"ERM not applicable for mature stage financial firm {symbol} due to: {str(e)}\n")
                        with open('missing_data.log', 'a') as f:
                            f.write('ERM not applicable for ' + symbol + ' due to: ' + str(e) + ' (mature financial firm)\n')
                        continue
                else:
                    try:
                        print("The company is a financial firm in the growth stage or stage indeterminate, applying the ERM for growing companies...")
                        
                        erm(symbol, stock_price, balance_sheet, income_stmt, xlsx, dfs, COST_OF_EQUITY, STABLE_ROE, HIGH_GROWTH_PERIOD, STABLE_GROWTH_PERIOD)
                        continue
                    except Exception as e:
                        print(f"ERM not applicable for growth stage financial firm {symbol} due to: {str(e)}\n")
                        with open('missing_data.log', 'a') as f:
                            f.write('ERM not applicable for ' + symbol + ' due to: ' + str(e) + '(growing financial firm)\n')
                        continue

            # Is not a financial firm, determine whether the company is in the growth stage or mature stage        
            elif average_revenue_growth is not None and average_revenue_growth > revenue_growth_threshold and reinvestment_rate is not None and reinvestment_rate > reinvestment_rate_threshold:
                try:
                    print("The company is not a financial firm and is a growth company, applying the ERM for growing companies...")
                    erm(symbol, stock_price, balance_sheet, income_stmt, xlsx, dfs, COST_OF_EQUITY, STABLE_ROE, HIGH_GROWTH_PERIOD, STABLE_GROWTH_PERIOD)
                    continue
                except Exception as e:
                    print(f"ERM not applicable for non-financial firm {symbol} due to: {str(e)}, applying DCF model...")
                    try:
                        dcf(symbol, stock_price, balance_sheet, income_stmt, cash_flow, financials_sorted, xlsx, dfs, COST_OF_EQUITY, DCF_GROWTH_RATE)
                        continue
                    except Exception as e:
                        print(f"Both ERM and DCF are not applicable for non-financial firm {symbol} due to: {str(e)}\n")
                        with open('missing_data.log', 'a') as f:
                            f.write('ERM/DCF not applicable for ' + symbol + ' due to: ' + str(e) + '(growing non-financial firm)\n')
                        continue
    
            else:
                print("The company is neither a financial firm nor a growth company, applying DCF model...")
                try:
                    dcf(symbol, stock_price, balance_sheet, income_stmt, cash_flow, financials_sorted, xlsx, dfs, COST_OF_EQUITY, DCF_GROWTH_RATE)
                    continue
                except Exception as e:
                    print(f"DCF not applicable for non-financial firm {symbol} due to: {str(e)}\n")
                    with open('missing_data.log', 'a') as f:
                        f.write('DCF not applicable for ' + symbol + ' due to: ' + str(e) + '(mature non-financial firm)\n')
                    continue


        except KeyError:
            print(f"KeyError occurred for: {symbol}. Skipping to next file.")
            with open('missing_data.log', 'a') as f:
                f.write('The script failed for ' + symbol + ' due to KeyError\n')
            continue
        except TypeError:
            print(f"TypeError occurred for: {symbol}. Skipping to next file.")
            with open('missing_data.log', 'a') as f:
                f.write('The script failed for ' + symbol + ' due to TypeError\n')
            continue
        except NameError:
            print(f"NameError occurred for: {symbol}. Skipping to next file.")
            with open('missing_data.log', 'a') as f:
                f.write('The script failed for ' + symbol + ' due to NameError\n')
            continue