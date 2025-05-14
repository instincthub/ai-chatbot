import uuid
from django.db import models
from django.conf import settings

class WidgetConfiguration(models.Model):
    """Model for storing chat widget configurations."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='widgets'
    )

    # Configuration
    primary_color = models.CharField(max_length=20, default='#2563EB')
    title = models.CharField(max_length=100, default='Support Chat')
    welcome_message = models.TextField(
        default='Hello! How can I help you today?'
    )

    # Domain restrictions
    allowed_domains = models.TextField(
        blank=True,
        help_text='Comma-separated list of domains where widget can be embedded'
    )

    # Feature toggles
    enable_file_upload = models.BooleanField(default=False)
    enable_feedback = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Usage statistics
    conversation_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name 