from rest_framework import serializers
from .models import Activity, Time, Count, Scale, Day, Journal, JournalEntry, Checklist




class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity

        fields = ['id','name', 'minimum', 'maximum', 'limit_timescale', 'description', 'primary_color', 'secondary_color','active', 'positive']


class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = ['id', 'name', 'minimum', 'maximum', 'description', 'active']

    description = serializers.CharField(allow_blank=True)


class CountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Count
        fields = '__all__'

class ScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scale
        fields = '__all__'


class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checklist
        fields = '__all__'



class DaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Day
        fields = '__all__'

class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id','detached', 'journal_pk', 'content', 'created_at', 'title']
