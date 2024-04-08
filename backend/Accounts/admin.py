from django.contrib import admin
from .models import UserAccount, SubscriptionModel, SubscriptionPlan, BankAccount

admin.site.register(UserAccount)
admin.site.register(SubscriptionPlan)
admin.site.register(SubscriptionModel)
admin.site.register(BankAccount)
