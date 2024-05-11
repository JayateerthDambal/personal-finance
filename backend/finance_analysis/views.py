from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from .models import Transaction, Category
from rest_framework.permissions import IsAuthenticated
from .serializers import KeywordSerializer
from Accounts.renderers import UserRenderer
import pandas as pd
from Accounts.models import BankAccount, UserAccount
from decimal import Decimal
from django.utils.dateparse import parse_date
import hashlib
from django.db.models import Q, Sum
import time


class KeywordCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = KeywordSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def generate_transaction_hash(self, date, description, amount, transaction_type, balance):
        hash_input = f"{date}{description}{amount}{transaction_type}{balance}"
        return hashlib.md5(hash_input.encode()).hexdigest()

    def match_category(self, description, user):
        # Retrieve all categories associated with the user
        categories = Category.objects.filter(user=user)
        for category in categories:
            # Check if any keyword matches the transaction description
            for keyword in category.keywords.all():
                if keyword.keyword.lower() in description.lower():
                    return category
        return None  # Return None or a default category if no match is found

    def post(self, request, account_id):
        try:
            bank_account = BankAccount.objects.get(
                id=account_id, user=request.user)
        except BankAccount.DoesNotExist:
            return Response({'error': 'Bank account not found'}, status=404)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        try:
            data = pd.read_csv(file)
            data['Debit'] = pd.to_numeric(data['Debit'].str.replace(
                ',', '').str.replace('"', ''), errors='coerce').fillna(0)
            data['Credit'] = pd.to_numeric(data['Credit'].str.replace(
                ',', '').str.replace('"', ''), errors='coerce').fillna(0)
            data['Balance'] = pd.to_numeric(data['Balance'].str.replace(
                ',', '').str.replace('"', ''), errors='coerce').fillna(0)
        except Exception as e:
            return Response({'error': f'Error reading file: {str(e)}'}, status=400)

        required_columns = ['Transaction Date',
                            'Description', 'Debit', 'Credit']
        if not all(column in data.columns for column in required_columns):
            return Response({'error': 'Missing required columns in the file'}, status=400)
        indexes = []
        for index, row in data.iterrows():
            try:
                indexes.append(index)
                category = self.match_category(
                    description=row['Description'], user=request.user)
                amount = row['Credit'] if row['Credit'] > 0 else row['Debit']
                transaction_type = 'Credit' if row['Credit'] > 0 else 'Debit'
                date = pd.to_datetime(
                    row['Transaction Date'], format="%d-%m-%Y")
                balance = row['Balance']
                transaction_hash = self.generate_transaction_hash(
                    date, row['Description'], amount, transaction_type, balance)
                defaults = {
                    'transaction_type': transaction_type,
                    'amount': Decimal(amount),
                    'category': category if category else None
                }
                Transaction.objects.update_or_create(
                    user=request.user,
                    bank_account=bank_account,
                    transaction_hash=transaction_hash,
                    date=date,
                    balance=balance,
                    description=row['Description'],
                    defaults=defaults
                )
            except Exception as e:
                return Response({'error': f'Error processing data row: {str(e)}'}, status=400)

        return Response({'message': indexes}, status=201)


class BankTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            bank_account = BankAccount.objects.get(
                id=account_id, user=request.user)
        except BankAccount.DoesNotExist:
            return Response({'error': 'Bank account not found'}, status=404)

        # Retrieve date range from query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Initialize the query
        transactions = Transaction.objects.filter(bank_account=bank_account)
        # Apply date filtering if both start_date and end_date are provided
        if start_date and end_date:
            start_date_parsed = parse_date(start_date)
            end_date_parsed = parse_date(end_date)
            if start_date_parsed and end_date_parsed:
                transactions = transactions.filter(
                    date__range=[start_date_parsed, end_date_parsed])
            else:
                return Response({'error': 'Invalid date format'}, status=400)

        # Serialize the transactions data
        transactions_data = [
            {
                "id": transaction.id,
                "date": transaction.date,
                "description": transaction.description,
                "amount": transaction.amount,
                "transaction_type": transaction.transaction_type,
                "balance": transaction.balance,
                "category": transaction.category.name if transaction.category else None
            }
            for transaction in transactions
        ]

        return Response(transactions_data)


class CalculateBalanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            # Ensure the bank account belongs to the logged-in user
            bank_account = BankAccount.objects.get(
                id=account_id, user=request.user)
        except BankAccount.DoesNotExist:
            return Response({'error': 'Bank account not found'}, status=404)

        # Fetch all transactions for the bank account
        transactions = Transaction.objects.filter(bank_account=bank_account)
        print(len(transactions))
        # Calculate total credits and debits
        total_credits = transactions.filter(transaction_type='Credit').aggregate(
            total=Sum('amount'))['total'] or 0
        total_debits = transactions.filter(transaction_type='Debit').aggregate(
            total=Sum('amount'))['total'] or 0

        # Calculate the balance
        balance = total_credits - total_debits

        return Response({
            'balance': balance,
            'total_credits': total_credits,
            'total_debits': total_debits,
            'account': bank_account.reference_name
        })
