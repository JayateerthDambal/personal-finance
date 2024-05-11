from django_cryptography.fields import encrypt
from django.utils import timezone
from django.db import models
from django.conf import settings
from Accounts.models import UserAccount, BankAccount


'''
This model helps to create different cateogories for each user.
Each category will be linked with a specific user.
A user can have multiple categories but one category can only belong to one user.
'''


class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    keywords = models.ManyToManyField(
        'Keyword', blank=True, related_name='categories')
    category_type = models.CharField(max_length=55, blank=True, null=True)
    is_default = models.BooleanField(default=False)  # To mark "Other" category

    def __str__(self):
        return f"{self.name} -> {self.user.email}"


class Keyword(models.Model):
    category = models.ForeignKey(
        Category, related_name='associated_keywords', on_delete=models.CASCADE)
    keyword = models.CharField(max_length=125)

    def __str__(self):
        return f"{self.category} -> {self.keyword}"


class Transaction(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True)
    transaction_type = models.CharField(
        max_length=10, choices=[('Credit', 'Credit'), ('Debit', 'Debit')])
    transaction_hash = models.CharField(max_length=32, unique=True)

    def __str__(self):
        return f"{self.description} -> {self.date} -> amount: {self.amount} => {self.user.email}"
