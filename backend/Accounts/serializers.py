from .models import UserAccount
from rest_framework import serializers
from xml.dom import ValidationErr
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .utils import Util


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        style={'input': 'password'}, write_only=True)

    class Meta:
        model = UserAccount
        fields = ["email", "first_name", "last_name",
                  "profession", "password", "password2"]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password don't Match")
        return attrs

    # Create the User using above data
    def create(self, validated_data):
        user = UserAccount.objects.create_user(**validated_data)

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
