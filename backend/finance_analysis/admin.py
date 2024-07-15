from django.contrib import admin
from .models import TransactionCategory, Transaction, Keyword, Account, AccountType

# Register different Models
admin.site.register(TransactionCategory)
admin.site.register(Transaction)
admin.site.register(Keyword)
admin.site.register(Account)
admin.site.register(AccountType)
