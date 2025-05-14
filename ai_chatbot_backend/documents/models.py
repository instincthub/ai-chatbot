import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

class Document(models.Model):
    """Model for storing uploaded documents in the knowledge base."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='documents/')
    content_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True)

    # Organization (for future multi-tenant support)
    organization_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Chunk(models.Model):
    """Model for storing document chunks created during processing."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='chunks'
    )
    content = models.TextField()
    chunk_index = models.PositiveIntegerField()

    # Metadata
    page_number = models.PositiveIntegerField(null=True, blank=True)
    section_title = models.CharField(max_length=255, blank=True)

    # Relationships for hierarchical chunking
    parent_chunk = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='child_chunks'
    )

    class Meta:
        ordering = ['document', 'chunk_index']

    def __str__(self):
        return f"{self.document.title} - Chunk {self.chunk_index}"

class Embedding(models.Model):
    """Model for storing vector embeddings of document chunks."""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    chunk = models.OneToOneField(
        Chunk,
        on_delete=models.CASCADE,
        related_name='embedding'
    )
    vector = models.JSONField()  # We'll convert this to pgvector in migrations

    # Metadata
    embedding_model = models.CharField(max_length=100)
    dimensions = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Embedding for {self.chunk}" 