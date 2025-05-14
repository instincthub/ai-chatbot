import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Conversation(models.Model):
    """Model for storing chat conversations."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    title = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True
    )

    # For anonymous usage via widget
    session_id = models.CharField(max_length=100, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Widget configuration if this conversation is from an embedded widget
    widget_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        if self.title:
            return self.title
        return f"Conversation {self.id}"

class Message(models.Model):
    """Model for storing individual messages in a conversation."""

    class Role(models.TextChoices):
        USER = 'user', _('User')
        ASSISTANT = 'assistant', _('Assistant')
        SYSTEM = 'system', _('System')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )
    content = models.TextField()

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    # For assistant messages, track which chunks were used
    referenced_chunks = models.ManyToManyField(
        'documents.Chunk',
        blank=True,
        related_name='referenced_in_messages'
    )

    # For tracking LLM performance
    response_time = models.FloatField(null=True, blank=True)
    llm_model = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..." 