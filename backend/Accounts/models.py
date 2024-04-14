from django.db import models
from django.utils import timezone
from django_cryptography.fields import encrypt

from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.core.validators import MinLengthValidator


class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    professions = (('student', 'Student'), ('software engineer',
                   'Software Engineer'), ('accountant', 'Accountant'),)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True)
    profession = models.CharField(max_length=255, choices=professions)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UserAccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return f"{self.first_name}"

    def __str__(self):
        return f"{self.email}"


class BankAccount(models.Model):
    user = models.ForeignKey(
        UserAccount, on_delete=models.CASCADE, related_name='bank_accounts')
    reference_name = models.CharField(max_length=125, default='MyBankAccount')
    account_type = models.CharField(max_length=55, choices=[(
        'savings', 'Savings'), ('checking', 'Checking'), ('current', 'Current')])

    def __str__(self):
        return f"A/C No. {self.reference_name} - {self.account_type}"


class BankStatement(models.Model):
    bank_account = models.ForeignKey(
        BankAccount, related_name='statements', on_delete=models.CASCADE)
    encrypted_data = models.BinaryField()
    upload_date = models.DateTimeField(auto_now_add=True)


class SubscriptionPlan(models.Model):
    DURATION_CHOICES = (('1M', '1 Month'), ('3M', '3 Months'),
                        ('6M', '6 Months'), ('12M', '12 Months'),)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=3, choices=DURATION_CHOICES)


class SubscriptionModel(models.Model):
    SUBSCRIPTION_STATUS_CHOICES = [
        ('active', 'Active'), ('cancelled', 'Cancelled'), ('inactive', 'Inactive'),]
    user = models.OneToOneField(
        UserAccount, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(
        SubscriptionPlan, on_delete=models.SET_NULL, null=True, related_name='subscriptions')
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    subscription_status = models.CharField(
        max_length=50, choices=SUBSCRIPTION_STATUS_CHOICES, default='inactive')
    shared_with_users_limit = models.IntegerField(default=2)

    def activate_subscription(self, plan):
        self.plan = plan
        self.subscription_start_date = timezone.now()
        self.subscription_end_date = self.subscription_start_date + \
            timezone.timedelta(days=plan.get_duration_days())
        self.subscription_status = 'active'
        self.save()

    def cancel_subscription(self):
        self.subscription_status = "cancelled"
        self.save()

    def is_subscription_active(self):
        return self.subscription_status == 'active' and self.subscription_end_date > timezone.now()

    def __str__(self):
        return f"Subscription for {self.user.email}"
