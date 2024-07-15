from django.urls import path
from . import views
urlpatterns = [
    # Create and login Accounts
    path("health-check/", views.serverHealth, name='check-health'),
    path("login/", views.UserLoginView.as_view(), name='user-login'),
    path("register/", views.UserRegistrationView.as_view(), name='user-register'),

    # User Profile
    path("profile/", views.UserProfileView.as_view(), name="user-profile"),

    # Verify Token
    path("verify-token/", views.VerifyTokenAPIView.as_view(), name='verify-token'),

    #  Bank Account Functions
    path('add-bank-account/', views.AccountCreateView.as_view(),
         name='add-bank-account'),
    path("get-accounts/", views.GetAccountsAPIView.as_view(), name='get-accounts'),

]
