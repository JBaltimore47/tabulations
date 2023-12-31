"""tabulate_it URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_api.views import ActivityViewSet, TimeViewSet, CountViewSet, ScaleViewSet, DayViewSet, JournalViewSet, JournalEntryViewSet, ChecklistViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'activity', ActivityViewSet, basename='activity')
router.register(r'time', TimeViewSet, basename='time')
router.register(r'count', CountViewSet, basename='count')
router.register(r'scale', ScaleViewSet, basename='scale')
router.register(r'checklist', ChecklistViewSet, basename='checklist')
router.register(r'day', DayViewSet, basename='day')
router.register(r'journal', JournalViewSet, basename='journal')
router.register(r'journal_entry', JournalEntryViewSet, basename='journal_entry')


urlpatterns = router.urls
# urlpatterns += path('admin/', admin.site.urls)


# urlpatterns = [
#     path('admin/', admin.site.urls),
# ]
