from django.db import models
from unixtimestampfield.fields import UnixTimeStampField
from django_jsonfield_backport.models import JSONField


# Create your models here.
class Activity(models.Model):
    name = models.CharField(max_length=256, unique=True)
    minimum = models.FloatField()                       #The minimum amount of hours that should be spent on this activity every day
    maximum = models.FloatField()                       #The maximum amount of hours that should be spent on this activity every day.
    limit_timescale = models.CharField(max_length=256)    #Does the limit apply for a day, week or month?
    description = models.CharField(max_length=512)
    active = models.BooleanField()
    primary_color = models.CharField(max_length=7) #fffccc
    secondary_color = models.CharField(max_length=7)
    positive = models.BooleanField()                 # Is more hours better or worse?


class Time(models.Model):
    name = models.CharField(max_length=256)
    minimum = models.FloatField()
    maximum = models.FloatField()                       # The amount of hours into the day, for example: 4.5 will represent 4:30AM, so it's just about interpreting the decimal into minutes
    description = models.CharField(max_length=512)
    active = models.BooleanField()


class Count(models.Model):
    name = models.CharField(max_length=256)
    limit = models.IntegerField()
    limit_timescale = models.CharField(max_length=256)    #Does the limit apply for a day, week or month?
    description = models.CharField(max_length=512)
    active = models.BooleanField()


class Scale(models.Model):
    name = models.CharField(max_length=256)
    description = models.CharField(max_length=512)
    active = models.BooleanField()




class Day(models.Model):
    date = models.CharField(max_length=10, unique=True)          #dd/mm/yyyy
    activities = JSONField()
    times = JSONField()
    counts = JSONField()
    scales = JSONField()



class Goals(models.Model):
    created_at = UnixTimeStampField(null=True, use_numeric=True, default=0.0)
    description = models.CharField(max_length=1024)
    desired_end_date = UnixTimeStampField(null=True, use_numeric=True, default=0.0)


class Rules(models.Model):
    created_at = UnixTimeStampField(null=True, use_numeric=True, default=0.0)
    description = models.CharField(max_length=1024)


class Journal(models.Model):
    name = models.CharField(max_length=256)
    created_at = UnixTimeStampField(null=True, use_numeric=True, default=0.0)
    page_count = models.IntegerField()

class JournalEntry(models.Model):
    journal_pk = models.IntegerField()
    created_at = UnixTimeStampField(null=True, use_numeric=True, default=0.0)
    content = models.CharField(max_length=16392)
