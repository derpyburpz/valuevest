from rest_framework import serializers
from .models import Stock, Portfolio, Watchlist

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            'id',
            'company_name',
            'exchange_ticker',
            'industry_group',
            'primary_sector',
            'sic_code',
            'country',
            'broad_group',
            'cost_of_capital',
            'cost_of_equity',
            'return_on_equity',
            'intrinsic_value',
            'growth',
            'model',
            'weighted_average_cost_of_capital',
            'enterprise_value',
            'equity_value',
            'terminal_value',
            'discounted_tv',
            'book_value_of_equity_per_share',
            'discounted_excess_returns'
        ]

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ['user', 'stock', 'quantity']

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['user', 'stock']
