from django.contrib import admin
from .models import Category, Transaction, Keyword

# Register different Models
admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(Keyword)
