"""
URL configuration for dvw_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from modeler.api import DataModelViewSet, SettingsViewSet

router = DefaultRouter()
router.register(r"models", DataModelViewSet)

# Custom URL patterns for settings to handle PATCH at collection level
settings_list = SettingsViewSet.as_view({
    'get': 'list',
    'post': 'create',
    'patch': 'patch_settings'  # Custom action for PATCH at collection level
})

settings_detail = SettingsViewSet.as_view({
    'get': 'list',  # Return the singleton for any detail view
    'put': 'update',
    'patch': 'partial_update'
})

settings_reset = SettingsViewSet.as_view({
    'post': 'reset'
})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/settings/", settings_list, name="settings-list"),
    path("api/settings/<uuid:pk>/", settings_detail, name="settings-detail"),
    path("api/settings/reset/", settings_reset, name="settings-reset"),
]
