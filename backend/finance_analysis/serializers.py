from rest_framework import serializers
from .models import Keyword, TransactionCategory, Account


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ['keyword']


class TransactionCategorySerializer(serializers.ModelSerializer):
    keywords = KeywordSerializer(many=True)

    class Meta:
        model = TransactionCategory
        fields = ['name', 'category_type', 'keywords']

    def create(self, validated_data):
        keywords_data = validated_data.pop('keywords')
        category = TransactionCategory.objects.create(**validated_data)
        for keyword_data in keywords_data:
            Keyword.objects.create(category=category, **keyword_data)
        return category


class CategorySerializer(serializers.ModelSerializer):
    keywords = serializers.ListField(
        child=serializers.CharField(), write_only=True)
    # Ensure this is part of the serialized fields
    account_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TransactionCategory
        fields = ['id', 'name', 'category_type', 'account_id', 'keywords']

    def validate(self, data):
        # Check for duplicate categories under the same account
        account_id = data.get('account_id')
        name = data.get('name')
        if self.instance:
            categories = TransactionCategory.objects.filter(
                name=name, bank_account_id=account_id).exclude(id=self.instance.id)
        else:
            categories = TransactionCategory.objects.filter(
                name=name, bank_account_id=account_id)

        if categories.exists():
            raise serializers.ValidationError(
                "A category with this name and account already exists.")
        return data

    def create(self, validated_data):
        keywords = validated_data.pop('keywords', [])
        bank_account_id = validated_data.pop('account_id', None)

        bank_account = Account.objects.get(id=bank_account_id)
        validated_data['bank_account'] = bank_account

        category = TransactionCategory.objects.create(**validated_data)
        self._handle_keywords(category, keywords)
        return category

    def update(self, instance, validated_data):
        keywords = validated_data.pop('keywords', [])
        if 'bank_account_id' in validated_data:
            bank_account_id = validated_data.pop('account_id')
            instance.bank_account = Account.objects.get(id=bank_account_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._handle_keywords(instance, keywords)
        return instance

    def _handle_keywords(self, category, keyword_texts):
        existing_keywords = {kw.keyword for kw in category.keywords.all()}
        new_keywords = set(keyword_texts) - existing_keywords

        # Add new keywords
        for keyword_text in new_keywords:
            Keyword.objects.create(category=category, keyword=keyword_text)

        # Remove old keywords that are not in the new list
        Keyword.objects.filter(category=category).exclude(
            keyword__in=keyword_texts).delete()

    def validate_keywords(self, value):
        user = self.context['request'].user
        duplicate_keywords = []
        for keyword_text in value:
            if Keyword.objects.filter(keyword=keyword_text, category__user=user).exclude(category=self.instance).exists():
                duplicate_keywords.append(keyword_text)
        if duplicate_keywords:
            raise serializers.ValidationError({
                'keywords': f'The following keywords already exist: {", ".join(duplicate_keywords)}'
            })
        return value

    def validate_account_id(self, value):
        try:
            Account.objects.get(id=value)
        except Account.DoesNotExist:
            raise serializers.ValidationError(
                "This bank account does not exist.")
        return value


class GetCategorySerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()

    class Meta:
        model = TransactionCategory
        fields = ['id', 'name', 'category_type', 'keywords']

    def get_keywords(self, obj):
        return [keyword.keyword for keyword in obj.keywords.all()]
