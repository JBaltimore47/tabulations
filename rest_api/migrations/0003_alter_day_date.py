# Generated by Django 4.1.5 on 2023-02-06 11:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rest_api', '0002_alter_activity_maximum_alter_activity_minimum_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='day',
            name='date',
            field=models.CharField(default='29/12/2022', max_length=10),
            preserve_default=False,
        ),
    ]
