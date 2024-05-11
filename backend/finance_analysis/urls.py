from django.urls import path
from . import views

urlpatterns = [
    # Create Category with keyword
    path("create-category/", views.KeywordCreateAPIView.as_view(),
         name='create-category'),
    path("upload-transactions/<int:account_id>/",
         views.TransactionUploadAPIView.as_view(), name='upload-transactions'),

    path("get-transactions/<int:account_id>/",
         views.BankTransactionsAPIView.as_view(), name='get-transactions'),
    path("check-balance/<int:account_id>/",
         views.CalculateBalanceAPIView.as_view(), name='check-balance'),

]
