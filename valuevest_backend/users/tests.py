from django.test import TestCase
from django.contrib.auth.models import User

class UserTestCase(TestCase):
    def setUp(self):
        User.objects.create_user(username='testuser', password='12345')

    def test_user_creation(self):
        user = User.objects.get(username='testuser')
        self.assertEqual(user.username, 'testuser')
