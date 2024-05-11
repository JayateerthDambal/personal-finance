from rest_framework import serializers
from .models import Keyword, Category


class KeywordSerializer(serializers.Serializer):
    category_name = serializers.CharField(required=True)
    category_type = serializers.CharField(required=True)
    keywords = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True
    )

    def create(self, validated_data):
        category_name = validated_data.get('category_name')
        category_type = validated_data.get('category_type')
        keywords_list = validated_data.get('keywords')
        user = self.context['request'].user

        # Ensure the category exists or create it
        category, _ = Category.objects.get_or_create(
            name=category_name, user=user, category_type=category_type)

        # Create a Keyword instance for each keyword in the list
        for keyword_text in keywords_list:
            Keyword.objects.create(category=category, keyword=keyword_text)

        return {'category_name': category_name, 'keywords': keywords_list, 'category_type': category_type}

    def validate_keywords(self, value):
        # Optional: Add any custom validation for your keywords here
        return value
    