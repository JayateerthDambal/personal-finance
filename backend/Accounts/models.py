from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, password2=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    professions = (
        ('student', 'Student'),
        ('software engineer', 'Software Engineer'),
        ('accountant', 'Accountant')
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, )
    last_name = models.CharField(max_length=255, blank=True)
    profession = models.CharField(max_length=255, choices=professions)
    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
           # Jay Dambal 
    def get_short_name(self):
        return f"{self.first_name}"

    def __str__(self):
        return f"{self.first_name} {self.last_name} -> {self.profession}"
