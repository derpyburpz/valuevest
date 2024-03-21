from django.contrib import admin
from django.urls import path
from .views import TestView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('test', TestView.as_view(), name='test'),
]
