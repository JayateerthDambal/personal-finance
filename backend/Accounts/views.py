from django.shortcuts import render
import json
from .models import UserAccount, BankAccount
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.files import File
from django.contrib.auth import authenticate
from .renderers import UserRenderer
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.response import Response
from rest_framework.views import APIView
from . import serializers
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.parsers import FileUploadParser


def serverHealth(request):
    return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }


class UserRegistrationView(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request):
        serializer = serializers.UserRegistrationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token = get_tokens_for_user(user=user)

            return Response({"token": token, "msg": "User Created Successfully."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request):
        serializer = serializers.UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.data.get("email")
            password = serializer.data.get("password")
            print(f"email: {email}, password: {password}")
            # Authenticating the User
            user = authenticate(email=email, password=password)
            print(user)
            if user is not None:
                token = get_tokens_for_user(user)
                return Response({"token": token, "msg": "user Logged In Succesfully"}, status=status.HTTP_200_OK)

            else:
                return Response({"errors": "Authnetication Failed"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        serializer = serializers.UserProfileSerializer(request.user)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        pass


class VerifyTokenAPIView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            user = request.user
            return Response({'user_id': user.id}, status=status.HTTP_200_OK)

        except AuthenticationFailed:
            return Response("Invaid Access Token", status=status.HTTP_401_UNAUTHORIZED)


class BankAccountCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = serializers.BankAccountSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CSVUploadView(APIView):
    parser_classes = [FileUploadParser]
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        bank_account_id = request.data.get('bank_account')

        if not bank_account_id:
            return Response({'errors': 'Bank Account is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bank_account = BankAccount.objects.get(
                user=user, account_number=bank_account_id)

        except BankAccount.DoesNotExist:
            return Response({'error': "Bank Account does not Exist"}, status=status.HTTP_404_NOT_FOUND)

        # uploaded_files =
