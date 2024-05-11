from .models import UserAccount, SubscriptionModel, SubscriptionPlan, BankAccount
from rest_framework import serializers
from xml.dom import ValidationErr
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import Util


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = UserAccount
        fields = ["email", "first_name", "last_name", "password", "password2"]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password don't match")
        return super().validate(attrs)

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one digit.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one letter.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2', None)
        user = UserAccount.objects.create_user(**validated_data)
        user.save()
        return user


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = UserAccount
        fields = ['email', 'password']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ["email", "first_name", "last_name", "profession"]


class ChangeUserPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=100,
                                     style={"inputy_type": "password"},
                                     write_only=True)
    password2 = serializers.CharField(max_length=100,
                                      style={"inputy_type": "password"},
                                      write_only=True)

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        user = self.context.get("user")
        if password != password2:
            raise serializers.ValidationError("Both Passwords doesn't match")

        user.set_password(password)
        user.save()
        return super().validate(attrs)


class SendPasswordResetEmailSerialzier(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ["email"]

    def validate(self, attrs):
        email = attrs.get("email")
        # Check if the User Entered EMail ID exists in Database
        if UserAccount.objects.filter(email=email).exists():
            user = UserAccount.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            url_link = f'http://localhost:3000/reset-password/{uid}/{token}'

            body = f"Click the following Link to Reset your Password\n: {url_link}"
            data = {
                "email_subject": "Reset Your Password",
                "email_body": body,
                "email_address": user.email
            }
            Util.send_mail(data=data)
            return attrs
        else:
            raise ValidationErr("You are not a registered user.")


class GetBankAccountSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = BankAccount
        fields = ['id', 'user', 'reference_name', 'account_type']


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'reference_name', 'account_type', 'user']
        # The user field should not be included in the request
        read_only_fields = ('user',)

    def validate(self, attrs):
        # Get the current user from the serializer context
        user = self.context['request'].user
        reference_name = attrs.get('reference_name')
        account_type = attrs.get('account_type')

        # Check if a bank account with the same reference_name and account_type exists for this user
        if BankAccount.objects.filter(user=user, reference_name=reference_name, account_type=account_type).exists():
            raise serializers.ValidationError(
                "A bank account with these details already exists.")

        return attrs

    def create(self, validated_data):
        # The user is added from the request context, ensuring the bank account is linked to the logged-in user
        user = self.context['request'].user
        return BankAccount.objects.create(user=user, **validated_data)


class BankStatementUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
