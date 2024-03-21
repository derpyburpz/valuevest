from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

class TestView(APIView):
    # Get smth from Django
    def get(self, request, format=None):
        print('API was called until')
        return Response("Hello!", status=201)

    # Send smth to Django to creat object
    # def post(self, request, *args, **kwargs):
    #     data = request.data
    #     return Response(data=data)

    # Update smth in Django                    
    # def put(self, request, *args, **kwargs):
    #     data = request.data
    #     return Response(data=data)
