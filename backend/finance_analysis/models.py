from django.db import models
from django.conf import settings
from Accounts.models import UserAccount


class AccountType(models.Model):
    name = models.CharField(max_length=50, null=True, blank=True)
    ASSET = 'asset'
    LIABILITY = 'liability'
    CATEGORY_CHOICES = [
        (ASSET, 'Asset'),
        (LIABILITY, 'Liability')
    ]
    category = models.CharField(
        max_length=10, choices=CATEGORY_CHOICES, default=ASSET)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Account(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    account_type = models.ForeignKey(AccountType, on_delete=models.CASCADE)
    # account_type = models.CharField(max_length=255)
    reference_name = models.CharField(max_length=125)
    balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.reference_name} ({self.account_type.name})"


class TransactionCategory(models.Model):
    user = models.ForeignKey("Accounts.UserAccount", on_delete=models.CASCADE)
    bank_account = models.ForeignKey(
        "Account", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class InterAccountTransaction(models.Model):
    from_account = models.ForeignKey(
        Account, related_name='from_transactions', on_delete=models.CASCADE)
    to_account = models.ForeignKey(
        Account, related_name='to_transactions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"From {self.from_account} to {self.to_account} of {self.amount} on {self.transaction_date}"


class Keyword(models.Model):
    category = models.ForeignKey(
        TransactionCategory, related_name='keywords', on_delete=models.CASCADE)
    keyword = models.CharField(max_length=100)

    def __str__(self):
        return self.keyword


class Transaction(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    bank_account = models.ForeignKey(Account, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00)
    category = models.ForeignKey(
        TransactionCategory, on_delete=models.CASCADE, null=True)
    transaction_type = models.CharField(
        max_length=10, choices=[('Credit', 'Credit'), ('Debit', 'Debit')])
    transaction_hash = models.CharField(max_length=32, unique=True)

    def __str__(self):
        return f"{self.description} -> {self.date} -> amount: {self.amount} => {self.user.email}"
