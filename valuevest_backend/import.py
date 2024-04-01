import pandas as pd
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valuevest_backend.settings")
django.setup()

from stocks.models import Stock

def populate_stocks_from_excel(file_path):
    stocks = []
    data_frame = pd.read_excel(file_path, sheet_name='Global alphabetical')
    
    for index, row in data_frame.iterrows():
        stock = Stock(
            company_name=row['Company Name'],
            exchange_ticker=row['Exchange:Ticker'],
            industry_group=row['Industry Group'],
            primary_sector=row['Primary Sector'],
            sic_code=row['SIC Code'],
            country=row['Country'],
            broad_group=row['Broad Group'],
            cost_of_capital=row['Cost Of Capital'] if pd.notnull(row['Cost Of Capital']) else 0,
            cost_of_equity=row['Cost Of Equity'] if pd.notnull(row['Cost Of Equity']) else 0,
            return_on_equity=row['Return On Equity'] if pd.notnull(row['Return On Equity']) else 0,
            intrinsic_value=row['Intrinsic Value'] if pd.notnull(row['Intrinsic Value']) else 0,
            growth = row['Growth'] if pd.notnull(row['Growth']) else 0,
            model=row['Model'] if pd.notnull(row['Model']) else 'default_value',
            weighted_average_cost_of_capital=row['Weighted Average Cost Of Capital'] if pd.notnull(row['Weighted Average Cost Of Capital']) else 0,
            enterprise_value=row['Enterprise Value'] if pd.notnull(row['Enterprise Value']) else 0,
            equity_value=row['Equity Value'] if pd.notnull(row['Equity Value']) else 0,
            terminal_value=row['Terminal Value (TV)'] if pd.notnull(row['Terminal Value (TV)']) else 0,
            discounted_tv=row['Discounted TV'] if pd.notnull(row['Discounted TV']) else 0,
            book_value_of_equity_per_share=row['Book Value of Equity Per Share'] if pd.notnull(row['Book Value of Equity Per Share']) else 0,
            discounted_excess_returns=row['Discounted Excess Returns (Terminal)'] if pd.notnull(row['Discounted Excess Returns (Terminal)']) else 0
        )

        stocks.append(stock)

    # Save all Stock instances to the database at ONCE
    Stock.objects.bulk_create(stocks)

populate_stocks_from_excel('C:\\Users\\jakec\\Desktop\\Mobile Apps\\valuevest_backend\\ind_fin_const.xlsx')



