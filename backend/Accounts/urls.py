from django.urls import path
from . import views
urlpatterns = [
    # Create and login Accounts
    path("login/", views.UserLoginView.as_view(), name='user-login'),
    path("register/", views.UserRegistrationView.as_view(), name='user-register'),

    # User Profile
    path("profile/", views.UserProfileView.as_view(), name="user-profile"),

    # Verify Token
    path("verify-token/", views.VerifyTokenAPIView.as_view(), name='verify-token'),

    #  Bank Account Functions
    path('add-bank-account/', views.BankAccountCreateView.as_view(),
         name='add-bank-account'),
    path("get-accounts/", views.GetBankAccountsAPIView.as_view(), name='get-accounts'),

    path("upload-statement/<int:account_id>", views.BankStatementUploadAPIView.as_view(),
         name="upload-statement"),

]
