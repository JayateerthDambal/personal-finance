from django.urls import path
from . import views
urlpatterns = [
    path("login/", views.UserLoginView.as_view(), name='user-login'),
    path("register/", views.UserRegistrationView.as_view(), name='user-register'),
    path("profile/", views.UserProfileView.as_view(), name="user-profile"),
]
