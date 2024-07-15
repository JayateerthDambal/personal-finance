from django.urls import path
from . import views

urlpatterns = [
    # Create Category with keyword
    path('categories/', views.CreateOrUpdateCategoryAPIView.as_view(),
         name='create-or-update-category'),
    path('delete/categories/<int:category_id>/', views.DeleteCategoryAPIView.as_view(),
         name='delete'),

    path("<int:account_id>/get-categories/",
         views.CategoryListView.as_view(), name='get-categories'),
    path("<int:account_id>/categorize-transactions/",
         views.CategorizeTransactionsAPIView.as_view(), name='categorize-transactions'),

    path("upload-transactions/<int:account_id>/",
         views.TransactionUploadAPIView.as_view(), name='upload-transactions'),

    path("get-transactions/<int:account_id>/",
         views.BankTransactionsAPIView.as_view(), name='get-transactions'),
    path("check-balance/<int:account_id>/",
         views.RunningBalanceAPIView.as_view(), name='check-balance'),

    path("<int:account_id>/month-summary/", views.MonthlySummaryAPIView.as_view(),
         name='monthly-summary'),

    path("financial-summary/", views.FinancialSummaryAPIView.as_view(),
         name="financial-summary"),

]
