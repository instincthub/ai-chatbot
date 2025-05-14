from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'content_type',
                  'file_size', 'created_at', 'updated_at', 'processed',
                  'processing_error']
        read_only_fields = ['id', 'created_at', 'updated_at', 'processed',
                            'processing_error', 'content_type', 'file_size']

    def create(self, validated_data):
        file = validated_data.get('file')
        validated_data['content_type'] = file.content_type
        validated_data['file_size'] = file.size
        return super().create(validated_data) 