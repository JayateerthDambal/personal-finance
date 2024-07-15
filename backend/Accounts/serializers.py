from .models import UserAccount, SubscriptionModel, SubscriptionPlan
from rest_framework import serializers
from xml.dom import ValidationErr
from django.utils.encoding import force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import Util
from finance_analysis.models import Account, AccountType


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


class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'name']


class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'name']


class AccountSerializer(serializers.ModelSerializer):
    account_type = AccountTypeSerializer()

    class Meta:
        model = Account
        fields = ['id', 'reference_name', 'account_type', 'balance']
        read_only_fields = ('user',)

    def validate(self, attrs):
        user = self.context['request'].user
        reference_name = attrs.get('reference_name')
        account_type_data = attrs.get('account_type')

        # Check for duplicate accounts under the same user with the given reference name and account type name
        if account_type_data:
            account_type_name = account_type_data.get('name')
            if Account.objects.filter(user=user, reference_name=reference_name, account_type__name=account_type_name).exists():
                raise serializers.ValidationError(
                    "An account with this reference name and account type already exists for this user.")

        return attrs

    def create(self, validated_data):
        account_type_data = validated_data.pop('account_type')
        account_type, _ = AccountType.objects.get_or_create(
            name=account_type_data['name'])
        user = self.context['request'].user
        return Account.objects.create(user=user, account_type=account_type, **validated_data)


class GetAccountsSerializer(serializers.ModelSerializer):
    account_type = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'reference_name', 'account_type', 'balance']

    def get_account_type(self, obj):
        return obj.account_type.name


class AccountUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
