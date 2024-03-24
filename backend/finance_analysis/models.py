from django.db import models
from django.conf import settings
from Accounts.models import UserAccount


class Category(models.Model):
    user = models.ForeignKey('Accounts.UserAccount', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.name}"


class Transaction(models.Model):
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey('Accounts.UserAccount', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.date} - {self.description} -> {self.amount}"
