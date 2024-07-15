from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction, TransactionCategory
from rest_framework.permissions import IsAuthenticated
from . import serializers
from Accounts.renderers import UserRenderer
import pandas as pd
from .models import Account
from decimal import Decimal
from django.utils.dateparse import parse_date
import hashlib
from django.db.models import Window, Sum
from django.shortcuts import get_object_or_404
from django.db.models.functions import Lag
from django.db.models.expressions import F
from django.db import transaction
from datetime import datetime


class CreateOrUpdateCategoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        with transaction.atomic():
            user = request.user
            data = request.data
            # Assuming this is provided for updates
            category_id = data.get('id')
            account_id = data.get('account_id')
            print(account_id)
            if not account_id:
                return Response({'error': 'Bank account ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            if category_id:
                try:
                    category = TransactionCategory.objects.get(
                        id=category_id, user=user)
                    serializer = serializers.CategorySerializer(
                        category, data=data, context={'request': request})
                except TransactionCategory.DoesNotExist:
                    return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                serializer = serializers.CategorySerializer(
                    data=data, context={'request': request})

            if serializer.is_valid():
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED if not category_id else status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def generate_transaction_hash(self, date, description, amount, transaction_type, balance):
        hash_input = f"{date}{description}{amount}{transaction_type}{balance}"
        return hashlib.md5(hash_input.encode()).hexdigest()

    def match_category(self, description, user):
        # Retrieve all categories associated with the user
        categories = TransactionCategory.objects.filter(user=user)
        for category in categories:
            # Check if any keyword matches the transaction description
            for keyword in category.keywords.all():
                if keyword.keyword.lower() in description.lower():
                    return category
        return None  # Return None or a default category if no match is found

    def post(self, request, account_id):
        try:
            bank_account = Account.objects.get(
                id=account_id, user=request.user)
        except Account.DoesNotExist:
            return Response({'error': 'Bank account not found'}, status=404)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        try:
            data = pd.read_csv(file)
            print(data.columns)
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


class CategorizeTransactionsAPIView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]

    def match_category(self, description, user):
        categories = TransactionCategory.objects.filter(user=user)
        for category in categories:
            for keyword in category.keywords.all():
                if keyword.keyword.lower() in description.lower():
                    return category
        return None

    def get(self, request, account_id):
        try:
            transactions = Transaction.objects.filter(
                user=request.user, bank_account_id=account_id)
            for transaction in transactions:
                new_category = self.match_category(
                    transaction.description, request.user)

                if new_category and transaction.category != new_category:
                    transaction.category = new_category
                    transaction.save()

            return Response({"msg": "Success"}, status=status.HTTP_200_OK)
        except Transaction.DoesNotExist:
            return Response({"error": "No Transactions detected"}, status=status.HTTP_400_BAD_REQUEST)


class BankTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        try:
            bank_account = Account.objects.get(
                id=account_id, user=request.user)
        except Account.DoesNotExist:
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


class RunningBalanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        bank_account = get_object_or_404(
            Account, id=account_id, user=request.user)
        transactions = Transaction.objects.filter(
            bank_account=bank_account).order_by('date')

        if not transactions.exists():
            return Response({"message": "No transactions found for this account."}, status=404)

        # Assuming the first transaction balance as the opening balance
        opening_balance = transactions.first().balance
        closing_balance = transactions.last().balance
        # Calculating running balance using Django Window functions
        transactions = transactions.annotate(
            previous_balance=Window(
                expression=Lag('balance', default=opening_balance),
                order_by=F('date').asc()
            )
        ).annotate(
            running_balance=F('previous_balance') + F('amount')
        )

        return Response({
            "opening_balance": opening_balance,
            "closing_balance": closing_balance,
        })


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        categories = TransactionCategory.objects.filter(
            user=request.user, bank_account=account_id).order_by('name')
        serializer = serializers.GetCategorySerializer(categories, many=True)
        return Response(serializer.data)


class DeleteCategoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, category_id):
        try:
            category = TransactionCategory.objects.get(
                id=category_id, user=request.user
            )
        except TransactionCategory.DoesNotExist:
            return Response(
                {"error": "Category not found or doesn't belong to this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MonthlySummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [UserRenderer]

    def get(self, request, account_id):
        user = request.user
        year = int(request.query_params.get('year', datetime.now().year))
        month = int(request.query_params.get('month', datetime.now().month))

        start_date = datetime(year, month, 1)
        end_date = datetime(year, month + 1, 1)

        transactions = Transaction.objects.filter(
            user=user, bank_account_id=account_id)
        print(transactions)
        total_balance = Account.objects.filter(user=user).aggregate(Sum('balance'))[
            'balance__sum'] or 0

        income = transactions.filter(amount__gt=0).aggregate(
            Sum('amount'))['amount__sum'] or 0
        expenses = transactions.filter(amount__lt=0).aggregate(
            Sum('amount'))['amount__sum'] or 0

        data = {
            'total_balance': total_balance,
            'income': income,
            'expenses': expenses,
        }

        return Response(data=data)


class FinancialSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [UserRenderer]

    def get(self, request):
        accounts = Account.objects.all()
        print(accounts)
        data = []

        return Response({"analysis": "accounts"}, status=status.HTTP_200_OK)
