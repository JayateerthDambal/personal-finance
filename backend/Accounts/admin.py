from django.contrib import admin
from .models import UserAccount, SubscriptionModel, SubscriptionPlan

admin.site.register(UserAccount)
admin.site.register(SubscriptionPlan)
admin.site.register(SubscriptionModel)
