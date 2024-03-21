from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):
    id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=255)
    exchange_ticker = models.CharField(max_length=50)
    industry_group = models.CharField(max_length=100)
    primary_sector = models.CharField(max_length=100)
    sic_code = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    broad_group = models.CharField(max_length=100)
    cost_of_capital = models.DecimalField(max_digits=20, decimal_places=10)
    cost_of_equity = models.DecimalField(max_digits=20, decimal_places=10, default = 0)
    return_on_equity = models.DecimalField(max_digits=20, decimal_places=10, default = 0)
    intrinsic_value = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    growth = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    model = models.CharField(max_length=100, default='default_value')
    weighted_average_cost_of_capital = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    enterprise_value = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    equity_value = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    terminal_value = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    discounted_tv = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    book_value_of_equity_per_share = models.DecimalField(max_digits=30, decimal_places=10, default = 0)
    discounted_excess_returns = models.DecimalField(max_digits=30, decimal_places=10, default = 0)

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    shares = models.IntegerField()

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
