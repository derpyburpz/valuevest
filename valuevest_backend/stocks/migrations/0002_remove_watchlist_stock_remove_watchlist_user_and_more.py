# Generated by Django 5.0.1 on 2024-01-30 19:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stocks', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='watchlist',
            name='stock',
        ),
        migrations.RemoveField(
            model_name='watchlist',
            name='user',
        ),
        migrations.DeleteModel(
            name='Portfolio',
        ),
        migrations.DeleteModel(
            name='Stock',
        ),
        migrations.DeleteModel(
            name='Watchlist',
        ),
    ]