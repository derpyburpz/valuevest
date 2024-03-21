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
import yfinance as yf

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
        # We group by the fields that define uniqueness for us
        fields = ['company_name', 'exchange_ticker', 'industry_group', 'primary_sector', 'sic_code', 'country', 'broad_group', 'cost_of_capital']
        
        # We annotate each group with the count of items in that group
        duplicates = Stock.objects.values(*fields).annotate(count=Count('id')).filter(count__gt=1)
        
        # Create a list to store the results
        results = []

        # Iterate over each duplicate group
        for duplicate in duplicates:
            # Get the ids of the stocks in the current duplicate group
            ids = Stock.objects.filter(**{field: duplicate[field] for field in fields}).values_list('id', flat=True)

            # Add the ids to the duplicate dictionary
            duplicate['ids'] = list(ids)

            # Add the duplicate dictionary to the results list
            results.append(duplicate)

        # Return the results as a response
        return Response(results)

    @action(detail=False, methods=['get'])
    def get_stock_by_id(self, request):
        # Get the 'id' from the query parameters
        stock_id = request.query_params.get('id', None)

        if stock_id is not None:
            # Get the stock with the given id
            stock = get_object_or_404(Stock, id=stock_id)

            # Create a dictionary with the stock's details
            stock_details = {
                'id': stock.id,
                'company_name': stock.company_name,
                'exchange_ticker': stock.exchange_ticker,
                'industry_group': stock.industry_group,
                'primary_sector': stock.primary_sector,
                'sic_code': stock.sic_code,
                'country': stock.country,
                'broad_group': stock.broad_group,
                'cost_of_capital': str(stock.cost_of_capital),  # Convert Decimal to string for JSON serialization
            }

            return Response(stock_details)
        else:
            return Response({'error': 'No id provided'}, status=400)
        
    @action(detail=False, methods=['get'])
    def get_stock_by_company_name(self, request):
        # Get the 'company_name' from the query parameters
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
                        current_price = float(hist['Close'].iloc[0])
                        
                        watchlist_data.append({
                        'company_name': item.stock.company_name,
                        'price': current_price,
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
            ticker = item.stock.exchange_ticker.split(':', 1)[1]
            try:
                stock = yf.Ticker(ticker)  
                hist = stock.history(period="1d")

                if not hist.empty and 'Close' in hist.columns:
                    current_price = float(hist['Close'].iloc[0])
                    
                    portfolio_data.append({
                        'company_name': item.stock.company_name,
                        'exchange_ticker': item.stock.exchange_ticker,
                        'shares': item.shares,
                        'price': current_price
                    })

            except Exception as e:
                print(f"Error fetching {ticker}: {e}")

        return Response(portfolio_data)

    @action(detail=False, methods=['post'])
    def add_to_portfolio(self, request):
        user_id = request.data.get('user_id')
        ticker = request.data.get('exchange_ticker')
        shares = request.data.get('shares')

        user = User.objects.get(id=user_id)
        stocks = Stock.objects.filter(exchange_ticker=ticker)

        if not stocks.exists():
            return Response({'error': f'Stock with ticker {ticker} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif stocks.count() > 1:
            return Response({'error': f'Duplicate stocks found with ticker {ticker}'}, status=status.HTTP_400_BAD_REQUEST)

        stock = stocks.first()

        Portfolio.objects.create(user=user, stock=stock, shares=shares)

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
    def get_portfolio_value(self, request):
        user_id = request.query_params.get('user_id')
        user = User.objects.get(id=user_id)

        portfolio_items = Portfolio.objects.filter(user=user)
        portfolio_value = 0

        for item in portfolio_items:
            ticker = item.stock.exchange_ticker.split(':', 1)[1]
            try:
                # Call yfinance for each ticker
                stock = yf.Ticker(ticker)  
                hist = stock.history(period="1d")

                if not hist.empty and 'Close' in hist.columns:
                    current_price = float(hist['Close'].iloc[0])
                    
                    # Calculate the value of each stock and add it to the total portfolio value
                    portfolio_value += item.shares * current_price

            except Exception as e:
                print(f"Error fetching {ticker}: {e}")

        return Response({'portfolio_value': portfolio_value})

    @action(detail=False, methods=['get'])
    def get_portfolio_pnl(self, request):
        user_id = request.query_params.get('user_id')
        user = User.objects.get(id=user_id)

        portfolio_items = Portfolio.objects.filter(user=user)
        total_pnl = 0

        for item in portfolio_items:
            ticker = item.stock.exchange_ticker.split(':', 1)[1]
            try:
                # Call yfinance for each ticker
                stock = yf.Ticker(ticker)  
                hist = stock.history(period="1d")

                if not hist.empty and 'Open' in hist.columns and 'Close' in hist.columns:
                    open_price = float(hist['Open'].iloc[0])
                    close_price = float(hist['Close'].iloc[0])

                    # Calculate the P&L for this stock and add it to the total P&L
                    pnl = (close_price - open_price) * item.shares
                    total_pnl += pnl

            except Exception as e:
                print(f"Error fetching {ticker}: {e}")

        return Response({'total_pnl': total_pnl})
    
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

        # Start with all stocks
        stocks = Stock.objects.all()

        # Filter by the provided attributes
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
    
