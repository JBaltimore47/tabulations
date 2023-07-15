from django.shortcuts import render

from rest_framework import viewsets
from .models import Activity, Time, Count, Scale, Day, Journal, JournalEntry
from .serializers import ActivitySerializer, TimeSerializer, CountSerializer, ScaleSerializer, DaySerializer, JournalSerializer, JournalEntrySerializer

# Create your views here.



"""
What do we need first of all?

1. The idea is first of all to create the standard ModelViews for the activity, times, counts and scales, this will
be very easy as there is no authentication

"""


class ActivityViewSet(viewsets.ModelViewSet):

    serializer_class = ActivitySerializer
    queryset = Activity.objects.all()





class TimeViewSet(viewsets.ModelViewSet):

    serializer_class = TimeSerializer
    queryset = Time.objects.all()


class CountViewSet(viewsets.ModelViewSet):

    serializer_class = CountSerializer
    queryset = Count.objects.all()


class ScaleViewSet(viewsets.ModelViewSet):

    serializer_class = ScaleSerializer
    queryset = Scale.objects.all()


class DayViewSet(viewsets.ModelViewSet):

    serializer_class = DaySerializer
    queryset = Day.objects.all()



class JournalViewSet(viewsets.ModelViewSet):
    serializer_class = JournalSerializer
    queryset = Journal.objects.all()


class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    queryset = JournalEntry.objects.all()
