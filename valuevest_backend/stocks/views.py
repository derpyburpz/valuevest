import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Stock, Watchlist, Portfolio
from .serializers import StockSerializer
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.db import transaction
import yfinance as yf
import math, time

logger = logging.getLogger(__name__)

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    ### Universal Actions ###
    @action(detail=False, methods=['get'])
    def search_stock(self, request):
        search_term = request.query_params.get('search', None)
        page_number = request.query_params.get('page', 1)
        if search_term is not None:
            queryset = self.get_queryset().filter(
                Q(company_name__icontains=search_term) |
                Q(exchange_ticker__icontains=search_term) |
                Q(sic_code__icontains=search_term) |
                Q(country__icontains=search_term)
            )
            paginator = Paginator(queryset, 30)
            page = paginator.get_page(page_number)
            serializer = self.get_serializer(page, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def get_duplicate_stocks(self, request):
        fields = ['company_name', 'exchange_ticker', 'industry_group', 'primary_sector', 'sic_code', 'country', 'broad_group', 'cost_of_capital']
        duplicates = Stock.objects.values(*fields).annotate(count=Count('id')).filter(count__gt=1)
        results = []

        for duplicate in duplicates:
            ids = Stock.objects.filter(**{field: duplicate[field] for field in fields}).values_list('id', flat=True)
            duplicate['ids'] = list(ids)
            results.append(duplicate)

        return Response(results)

    @action(detail=False, methods=['get'])
    def get_stock_by_id(self, request):
        stock_id = request.query_params.get('id', None)

        if stock_id is not None:
            stock = get_object_or_404(Stock, id=stock_id)

            stock_details = {
                'id': stock.id,
                'company_name': stock.company_name,
                'exchange_ticker': stock.exchange_ticker,
                'industry_group': stock.industry_group,
                'primary_sector': stock.primary_sector,
                'sic_code': stock.sic_code,
                'country': stock.country,
                'broad_group': stock.broad_group,
                'cost_of_capital': str(stock.cost_of_capital),
            }

            return Response(stock_details)
        else:
            return Response({'error': 'No id provided'}, status=400)
        
    @action(detail=False, methods=['get'])
    def get_stock_by_company_name(self, request):
        exchange_ticker = request.query_params.get('exchange_ticker', None)

        if exchange_ticker is not None:
            stock = get_object_or_404(Stock, exchange_ticker=exchange_ticker)

            stock_details = {
                'id': stock.id,
                'company_name': stock.company_name,
                'exchange_ticker': stock.exchange_ticker,
                'industry_group': stock.industry_group,
                'primary_sector': stock.primary_sector,
                'sic_code': stock.sic_code,
                'country': stock.country,
                'broad_group': stock.broad_group,
                'cost_of_capital': str(stock.cost_of_capital),
            }

            return Response(stock_details)
        else:
            return Response({'error': 'No company name provided'}, status=400)



    ## ALL USERS ##
    @action(detail=False, methods=['delete'])
    def clear_stocks(self, request):
        Stock.objects.all().delete()
        return Response({'message': 'Stocks cleared'})



    ### Watchlist Actions ###
    @action(detail=False, methods=['post'])
    def add_to_watchlist(self, request):
        user_id = request.data.get('user_id')
        ticker = request.data.get('exchange_ticker')

        user = User.objects.get(id=user_id)
        stocks = Stock.objects.filter(exchange_ticker=ticker)

        if not stocks.exists():
            return Response({'error': f'Stock with ticker {ticker} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif stocks.count() > 1:
            return Response({'error': f'Duplicate stocks found with ticker {ticker}'}, status=status.HTTP_400_BAD_REQUEST)

        stock = stocks.first()

        Watchlist.objects.create(user=user, stock=stock)

        return Response({'message': 'Stock added to watchlist'})

    @action(detail=False, methods=['get'])
    def get_watchlist(self, request):
        try:
            user_id = request.query_params.get('user_id')
            user = User.objects.get(id=user_id)
            watchlist = Watchlist.objects.filter(user=user)
            watchlist_data = []
            
            for item in watchlist:
                ticker = item.stock.exchange_ticker.split(':', 1)[1]  # Split to get symbol
                print(ticker)
                try:
                    # Call yfinance for each ticker
                    stock = yf.Ticker(ticker)  
                    hist = stock.history(period="1d")

                    if not hist.empty and 'Close' in hist.columns:
                        latest_price = float(hist['Close'].iloc[0])
                        
                        watchlist_data.append({
                        'company_name': item.stock.company_name,
                        'latest_price': latest_price,
                        'exchange_ticker': item.stock.exchange_ticker  
                        })

                except Exception as e:
                    print(f"Error fetching {ticker}: {e}")

            return Response(watchlist_data)
        except User.DoesNotExist:
            logger.error(f"Failed to get watchlist: No user found with ID {user_id}")
            return Response({'error': f'No user found with ID {user_id}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to get watchlist: {str(e)}")
            return Response({'error': 'Failed to get watchlist'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'])
    def remove_from_watchlist(self, request):
        user_id = request.data.get('user_id')
        ticker = request.data.get('exchange_ticker')

        user = User.objects.get(id=user_id)
        stocks = Stock.objects.filter(exchange_ticker=ticker)

        if not stocks.exists():
            return Response({'error': f'Stock with ticker {ticker} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif stocks.count() > 1:
            return Response({'error': f'Duplicate stocks found with ticker {ticker}'}, status=status.HTTP_400_BAD_REQUEST)

        stock = stocks.first()

        watchlist_item = Watchlist.objects.filter(user=user, stock=stock)
        if watchlist_item.exists():
            watchlist_item.delete()
            return Response({'message': 'Stock removed from watchlist'})
        else:
            return Response({'message': 'Stock not found in watchlist'})
 
    ## ALL USERS ##
    @action(detail=False, methods=['delete'])
    def clear_watchlist(self, request):
        Watchlist.objects.all().delete()
        return Response({'message': 'All watchlists cleared'})
    
    @action(detail=False, methods=['delete'])
    def delete_stock_by_id(self, request):
        try:
            data = request.data
            id = data['id']
            stock = Stock.objects.get(id=id)
            stock.delete()
            return Response({'message': 'Stock deleted'}, status=200)
        except Stock.DoesNotExist:
            return Response({'error': 'Stock not found'}, status=404)



    ### Portfolio Actions ###
    @action(detail=False, methods=['get'])
    def get_portfolio(self, request):
        user_id = request.query_params.get('user_id')
        user = User.objects.get(id=user_id)

        portfolio_items = Portfolio.objects.filter(user=user)
        portfolio_data = []

        for item in portfolio_items:
            symbol = item.stock.exchange_ticker.split(':', 1)[1]
            try:
                stock = yf.Ticker(symbol)  
                hist = stock.history(period="1d")

                if not hist.empty and 'Close' in hist.columns:
                    latest_price = float(hist['Close'].iloc[0])
                    price_change = ((latest_price - float(item.purchase_price)) / float(item.purchase_price)) * 100
                    
                    portfolio_data.append({
                        'company_name': item.stock.company_name,
                        'exchange_ticker': item.stock.exchange_ticker,
                        'shares': item.shares,
                        'latest_price': latest_price,
                        'price_change': price_change
                    })

            except Exception as e:
                print(f"Error fetching {symbol}: {e}")

        return Response(portfolio_data)

    @action(detail=False, methods=['post'])
    def add_to_portfolio(self, request):
        user_id = request.data.get('user_id')
        ticker = request.data.get('exchange_ticker')
        shares = request.data.get('shares')

        if not user_id or not ticker or not shares:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        stocks = Stock.objects.filter(exchange_ticker=ticker)
        if not stocks.exists():
            return Response({'error': f'Stock with ticker {ticker} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif stocks.count() > 1:
            return Response({'error': f'Duplicate stocks found with ticker {ticker}'}, status=status.HTTP_400_BAD_REQUEST)

        stock = stocks.first()

        if Portfolio.objects.filter(user=user, stock=stock).exists():
            return Response({'error': 'Stock already exists in the portfolio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            symbol = ticker.split(':')[1].strip().upper()
            stock_info = yf.Ticker(symbol).history(period="1d")
            latest_price = float(stock_info['Close'].iloc[0])
        except Exception as e:
            return Response({'error': 'Failed to fetch stock price'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        with transaction.atomic():
            Portfolio.objects.create(user=user, stock=stock, shares=shares, purchase_price=latest_price)

        return Response({'message': 'Stock added to portfolio'})
    
    @action(detail=False, methods=['delete'])
    def remove_from_portfolio(self, request):
        user_id = request.data.get('user_id')
        ticker = request.data.get('exchange_ticker')

        user = User.objects.get(id=user_id)
        stocks = Stock.objects.filter(exchange_ticker=ticker)

        if not stocks.exists():
            return Response({'error': f'Stock with ticker {ticker} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif stocks.count() > 1:
            return Response({'error': f'Duplicate stocks found with ticker {ticker}'}, status=status.HTTP_400_BAD_REQUEST)

        stock = stocks.first()

        portfolio_item = Portfolio.objects.filter(user=user, stock=stock)
        if portfolio_item.exists():
            portfolio_item.delete()
            return Response({'message': 'Stock removed from portfolio'})
        else:
            return Response({'message': 'Stock not found in portfolio'})

    @action(detail=False, methods=['get'])
    def get_portfolio_status(self, request):
        user_id = request.query_params.get('user_id')
        user = User.objects.get(id=user_id)
        portfolio_items = Portfolio.objects.filter(user=user)
        
        portfolio_value = 0
        total_pnl = 0
        total_cost_basis = 0
        total_market_value = 0
        
        for item in portfolio_items:
            symbol = item.stock.exchange_ticker.split(':', 1)[1]
            try:
                stock_info = yf.Ticker(symbol)
                hist = stock_info.history(period="1d")
                if not hist.empty:
                    if 'Close' in hist.columns:
                        current_price = float(hist['Close'].iloc[0])
                        purchase_price = float(item.purchase_price)
                        market_value = item.shares * current_price
                        cost_basis = item.shares * item.purchase_price
                        
                        portfolio_value += market_value
                        total_market_value += market_value
                        total_cost_basis += float(cost_basis)
                        
                        pnl = (current_price - purchase_price) * item.shares
                        total_pnl += pnl
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
        
        overall_performance = (total_market_value - float(total_cost_basis))
        
        return Response({
            'portfolio_value': portfolio_value,
            'total_pnl': total_pnl,
            'total_cost_basis': total_cost_basis,
            'total_market_value': total_market_value,
            'overall_performance': overall_performance
        })
    
    @action(detail=False, methods=['delete'])
    def clear_portfolio_by_id(self, request):
        user_id = request.data.get('user_id')
        user = User.objects.get(id=user_id)
        Portfolio.objects.filter(user=user).delete()
        return Response({'message': 'Portfolio cleared'})

    ## ALL USERS ##
    @action(detail=False, methods=['delete'])
    def clear_portfolio(self, request):
        Portfolio.objects.all().delete()
        return Response({'message': 'All portfolios cleared'})



    ### Intrinsic Valuation Actions ###
    @action(detail=False, methods=['get'])
    def get_intrinsic(self, request):
        ticker = request.query_params.get('ticker', None)
        symbol = ticker.split(':')[1].strip().upper()
        intrinsic_value = None
        latest_price = None
        try:
            stock = yf.Ticker(symbol)
            latest_price = stock.info['previousClose']
            stock_model = get_object_or_404(Stock, exchange_ticker=ticker)
            intrinsic_value = float(stock_model.intrinsic_value)

        except Exception as e:
            print(f"Error fetching {ticker} from yfinance: {e}")

        return Response({'Intrinsic_Value': intrinsic_value, 'Latest_Price': latest_price})


    @action(detail=False, methods=['get'])
    def get_ranking(self, request):
        stocks = Stock.objects.filter(growth__gt=0, growth__lte=25)

        top_stocks = stocks.order_by('-growth')[:50]

        over_under_valued_stocks = []
        counter = 0
        for stock in top_stocks:
            try:
                company_name = stock.company_name
                symbol = stock.exchange_ticker.split(':')[1].strip().upper()
                yf_stock = yf.Ticker(symbol)
                latest_price = float(yf_stock.info['previousClose'])
                intrinsic_value = float(stock.intrinsic_value)
                price_change = ((intrinsic_value - latest_price) / latest_price) * 100
                original_growth = stock.growth * 100
                counter += 1

                over_under_valued_stocks.append({
                    'company_name': company_name,
                    'price_change': price_change,
                    'growth': original_growth,
                    'count': counter
                })

            except Exception as e:
                print(f"An error occurred: {e}")

        return Response(over_under_valued_stocks)
    

    @action(detail=False, methods=['get'])
    def get_ranking_by_attribute(self, request):
        industry_group = request.query_params.get('industry_group', None)
        country = request.query_params.get('country', None)
        model = request.query_params.get('model', None)
        exchange = request.query_params.get('exchange', None)

        stocks = Stock.objects.all()

        if industry_group is not None:
            stocks = stocks.filter(industry_group=industry_group)
        if country is not None:
            stocks = stocks.filter(country=country)
        if model is not None:
            stocks = stocks.filter(model=model)
        if exchange is not None:
            stocks = stocks.filter(exchange_ticker__startswith=exchange + ":")

        # 0 < Growth <= 25
        stocks = stocks.filter(growth__gt=0, growth__lte=25)

        # Top 50 in Desc (Growth)
        top_stocks = stocks.order_by('-growth')[:50]

        over_under_valued_stocks = []
        counter = 0
        for stock in top_stocks:
            try:
                company_name = stock.company_name
                symbol = stock.exchange_ticker.split(':')[1].strip().upper()
                yf_stock = yf.Ticker(symbol)
                latest_price = float(yf_stock.info['previousClose'])
                intrinsic_value = float(stock.intrinsic_value)
                price_change = ((intrinsic_value - latest_price) / latest_price) * 100
                price_change = round(price_change, 0)
                intrinsic_value = round(intrinsic_value, 2)
                growth = stock.growth * 100
                counter += 1

                over_under_valued_stocks.append({
                    'count': counter,
                    'company_name': company_name,
                    'intrinsic_value': intrinsic_value,
                    'latest_price': latest_price,
                    'price_change': price_change,   # Growth label in frontend
                    'model': stock.model,
                    'country': stock.country,
                    'industry_group': stock.industry_group,
                    'growth': growth,
                    'exchange_ticker': stock.exchange_ticker,
                })

            except Exception as e:
                print(f"An error occurred: {e}")

        return Response(over_under_valued_stocks)
    
    @action(detail=False, methods=['get'])
    def get_stock_details(self, request):
        ticker = request.query_params.get('ticker', None)
        user_id = request.query_params.get('user_id', None)

        if ticker is None:
            return Response({'error': 'Ticker parameter missing.'}, status=status.HTTP_400_BAD_REQUEST)
        
        symbol = ticker.split(':')[1].strip().upper()

        try:
            stock_model = get_object_or_404(Stock, exchange_ticker=ticker)
            yf_stock = yf.Ticker(symbol)

            income_stmt = yf_stock.financials
            balance_sheet = yf_stock.balance_sheet
            cashflow_stmt = yf_stock.cashflow

            try:
                net_income = income_stmt.at['Net Income', income_stmt.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                net_income = "Not found"

            try:
                shareholders_equity = balance_sheet.at['Stockholders Equity', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                shareholders_equity = "Not found"

            roe = net_income / shareholders_equity if (net_income != "Not found") and (shareholders_equity != "Not found") else "Not found"

            try:
                total_assets = balance_sheet.at['Total Assets', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                total_assets = "Not found"

            try:
                total_liabilities = balance_sheet.at['Total Liabilities Net Minority Interest', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                total_liabilities = "Not found"

            total_book_value_equity = total_assets - total_liabilities if (total_assets != "Not found") and (total_liabilities != "Not found") else "Not found"

            try:
                shares_outstanding = yf_stock.info['sharesOutstanding'] / 1000000
                time.sleep(0.05)
            except:
                shares_outstanding = "Not found"

            try:
                stock_info = yf_stock.history(period="1d")
                latest_price = float(stock_info['Close'].iloc[0])
            except:
                latest_price = "Not found"

            market_cap = latest_price * shares_outstanding if (latest_price != "Not found") and (shares_outstanding != "Not found") and not math.isnan(shares_outstanding) and shares_outstanding != 0 else "Not found"

            try:
                total_debt = balance_sheet.at['Total Debt', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                total_debt = "Not found"

            try:
                enterprise_value = yf_stock.info['enterpriseValue'] / 1000000
                time.sleep(0.05)
            except:
                enterprise_value = "Not found"

            try:
                revenue = income_stmt.at['Total Revenue', income_stmt.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                revenue = "Not found"

            try:
                ebitda = yf_stock.info['ebitda'] / 1000000
                time.sleep(0.05)
            except:
                ebitda = "Not found"

            try:
                ebit = income_stmt.at['Ebit', income_stmt.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                ebit = "Not found"

            try:
                free_cash_flow = cashflow_stmt.at['Free Cash Flow', cashflow_stmt.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                free_cash_flow = "Not found"

            try:
                operating_cash_flow = cashflow_stmt.at['Total Cash From Operating Activities', cashflow_stmt.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                operating_cash_flow = "Not found"

            try:
                current_assets = balance_sheet.at['Total Current Assets', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                current_assets = "Not found"

            try:
                current_liabilities = balance_sheet.at['Total Current Liabilities', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                current_liabilities = "Not found"

            try:
                inventory = balance_sheet.at['Inventory', balance_sheet.columns[0]] / 1000000
                time.sleep(0.05)
            except:
                inventory = "Not found"

            try:
                invested_capital = total_assets - current_liabilities if (total_assets != "Not found") and (current_liabilities != "Not found") else "Not found"
            except:
                invested_capital = "Not found"

            try:
                earnings_yield = yf_stock.info['earningsYield']
                time.sleep(0.05)
            except:
                earnings_yield = "Not found"

            try:
                dividend_yield = yf_stock.info['dividendYield']
                time.sleep(0.05)
            except:
                dividend_yield = "Not found"

            try:
                payout_ratio = yf_stock.info['payoutRatio']
                time.sleep(0.05)
            except:
                payout_ratio = "Not found"

            try:
                buyback_yield = yf_stock.info['buybackYield']
                time.sleep(0.05)
            except:
                buyback_yield = "Not found"

            stock_details = {
                'company_name': stock_model.company_name,
                'exchange_ticker': stock_model.exchange_ticker,
                'sector': stock_model.primary_sector,
                'industry_group': stock_model.industry_group,
                'country': stock_model.country,
                'current_price': latest_price,
                'high_price': yf_stock.info.get('dayHigh', "Not found"),
                'low_price': yf_stock.info.get('dayLow', "Not found"),
                'market_cap': market_cap,
                'pe_ratio': yf_stock.info.get('trailingPE', "Not found"),
                'ps_ratio': market_cap / revenue if (market_cap != "Not found") and (revenue != "Not found") else "Not found",
                'pb_ratio': market_cap / total_book_value_equity if (market_cap != "Not found") and (total_book_value_equity != "Not found") else "Not found",
                'p_fcf_ratio': market_cap / free_cash_flow if (market_cap != "Not found") and (free_cash_flow != "Not found") else "Not found",
                'p_ocf_ratio': market_cap / operating_cash_flow if (market_cap != "Not found") and (operating_cash_flow != "Not found") else "Not found",
                'ev_revenue': enterprise_value / revenue if (enterprise_value != "Not found") and (revenue != "Not found") else "Not found",
                'ev_ebitda': enterprise_value / ebitda if (enterprise_value != "Not found") and (ebitda != "Not found") else "Not found",
                'ev_ebit': enterprise_value / ebit if (enterprise_value != "Not found") and (ebit != "Not found") else "Not found",
                'ev_fcf': enterprise_value / free_cash_flow if (enterprise_value != "Not found") and (free_cash_flow != "Not found") else "Not found",
                'debt_equity': total_debt / shareholders_equity if (total_debt != "Not found") and (shareholders_equity != "Not found") else "Not found",
                'debt_ebitda': total_debt / ebitda if (total_debt != "Not found") and (ebitda != "Not found") else "Not found",
                'debt_fcf': total_debt / free_cash_flow if (total_debt != "Not found") and (free_cash_flow != "Not found") else "Not found",
                'quick_ratio': (current_assets - inventory) / current_liabilities if (current_assets != "Not found") and (inventory != "Not found") and \
                                (current_liabilities != "Not found") else "Not found",
                'current_ratio': current_assets / current_liabilities if (current_assets != "Not found") and (current_liabilities != "Not found") else "Not found",
                'asset_turnover': revenue / total_assets if (revenue != "Not found") and (total_assets != "Not found") else "Not found",
                'return_on_equity': roe,
                'return_on_assets': net_income / total_assets if (net_income != "Not found") and (total_assets != "Not found") else "Not found",
                'return_on_invested_capital': net_income / invested_capital if (net_income != "Not found") and (invested_capital != "Not found") else "Not found",
                'earnings_yield': earnings_yield,
                'free_cash_flow_yield': free_cash_flow / market_cap if (free_cash_flow != "Not found") and (market_cap != "Not found") else "Not found",
                'dividend_yield': dividend_yield,
                'payout_ratio': payout_ratio,
                'buyback_yield': buyback_yield,
                'total_return': (latest_price + dividend_yield) / latest_price - 1 if (latest_price != "Not found") and (dividend_yield != "Not found") else "Not found",
            }

            if user_id is not None:
                try:
                    portfolio_item = Portfolio.objects.get(user_id=user_id, stock=stock_model)
                    stock_details['purchase_price'] = float(portfolio_item.purchase_price)
                    stock_details['shares'] = float(portfolio_item.shares)
                    raw_price_change = latest_price - float(portfolio_item.purchase_price)
                    stock_details['raw_price_change'] = raw_price_change
                    stock_details['price_change'] = (raw_price_change / float(portfolio_item.purchase_price)) * 100

                except Portfolio.DoesNotExist:
                    stock_details['purchase_price'] = None
                    stock_details['shares'] = None
                    stock_details['raw_price_change'] = None
                    stock_details['price_change'] = None

            return Response(stock_details)

        except Exception as e:
            print(f"Error fetching {ticker} details: {e}")
            return Response({'error': 'Failed to fetch stock details.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)