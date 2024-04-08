from django.urls import path
from . import views

urlpatterns = [
    # Create Category with keyword
    path("create-category/", views.KeywordCreateAPIView.as_view(),
         name='create-category'),

]
