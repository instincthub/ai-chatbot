# Database Schema Design and Initial Migrations

## .1 Design Core Database Schema

Create a schema diagram (you can use tools like dbdiagram.io or draw.io) with the following entities:

1. User
2. Document
3. Chunk
4. Embedding
5. Conversation
6. Message

The core relationships are:

- Document has many Chunks
- Chunk has one Embedding
- Conversation has many Messages
- Message references zero or many Chunks (for citations)

### .2 Initialize Django Project

#### Command to create django project

```bash
# 1. Create and activate virtual environment
python -m venv venv

# For Windows
venv\Scripts\activate

# For macOS/Linux
source venv/bin/activate

# 2. Install Django
pip install django

# Verify installation
python -m django --version

# 3. Create Django project
django-admin startproject ai_chatbot_backend

# Navigate to project directory
cd ai_chatbot_backend

# 4. Run initial migrations
python manage.py migrate

# 5. Start development server
python manage.py runserver
```

1. Create Django project structure:

   ```bash
   cd backend
   mkdir -p config/settings
   touch config/__init__.py
   touch config/asgi.py
   touch config/wsgi.py
   touch config/urls.py
   touch config/settings/__init__.py
   touch config/settings/base.py
   touch config/settings/development.py
   touch config/settings/production.py
   ```

2. Create base settings in config/settings/base.py:

   ```python
   import os
   from pathlib import Path

   # Build paths inside the project
   BASE_DIR = Path(__file__).resolve().parent.parent.parent

   # Security settings (override in production)
   SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-key-for-dev')
   DEBUG = bool(int(os.environ.get('DEBUG', '0')))
   ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

   # Application definition
   INSTALLED_APPS = [
       # Django apps
       'django.contrib.admin',
       'django.contrib.auth',
       'django.contrib.contenttypes',
       'django.contrib.sessions',
       'django.contrib.messages',
       'django.contrib.staticfiles',

       # Third-party apps
       'rest_framework',
       'rest_framework_simplejwt',
       'drf_spectacular',

       # Local apps
       'core',
       'documents',
       'knowledge_base',
       'chat',
   ]

   MIDDLEWARE = [
       'django.middleware.security.SecurityMiddleware',
       'whitenoise.middleware.WhiteNoiseMiddleware',
       'django.contrib.sessions.middleware.SessionMiddleware',
       'django.middleware.common.CommonMiddleware',
       'django.middleware.csrf.CsrfViewMiddleware',
       'django.contrib.auth.middleware.AuthenticationMiddleware',
       'django.contrib.messages.middleware.MessageMiddleware',
       'django.middleware.clickjacking.XFrameOptionsMiddleware',
   ]

   ROOT_URLCONF = 'config.urls'

   TEMPLATES = [
       {
           'BACKEND': 'django.template.backends.django.DjangoTemplates',
           'DIRS': [],
           'APP_DIRS': True,
           'OPTIONS': {
               'context_processors': [
                   'django.template.context_processors.debug',
                   'django.template.context_processors.request',
                   'django.contrib.auth.context_processors.auth',
                   'django.contrib.messages.context_processors.messages',
               ],
           },
       },
   ]

   WSGI_APPLICATION = 'config.wsgi.application'

   # Database
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.environ.get('POSTGRES_DB', 'supportbot'),
           'USER': os.environ.get('POSTGRES_USER', 'postgres'),
           'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
           'HOST': os.environ.get('POSTGRES_HOST', 'db'),
           'PORT': os.environ.get('POSTGRES_PORT', '5432'),
       }
   }

   # Password validation
   AUTH_PASSWORD_VALIDATORS = [
       {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
       {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
       {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
       {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
   ]

   # Internationalization
   LANGUAGE_CODE = 'en-us'
   TIME_ZONE = 'UTC'
   USE_I18N = True
   USE_TZ = True

   # Static files
   STATIC_URL = 'static/'
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

   # Media files
   MEDIA_URL = 'media/'
   MEDIA_ROOT = BASE_DIR / 'media'

   # Default primary key field type
   DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

   # REST Framework settings
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': (
           'rest_framework_simplejwt.authentication.JWTAuthentication',
       ),
       'DEFAULT_PERMISSION_CLASSES': [
           'rest_framework.permissions.IsAuthenticated',
       ],
       'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
   }

   # DRF Spectacular settings
   SPECTACULAR_SETTINGS = {
       'TITLE': 'Support Chatbot API',
       'DESCRIPTION': 'API for Customer Support Chatbot with RAG',
       'VERSION': '1.0.0',
   }

   # Celery settings
   CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
   CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
   CELERY_ACCEPT_CONTENT = ['json']
   CELERY_TASK_SERIALIZER = 'json'
   CELERY_RESULT_SERIALIZER = 'json'
   ```

3. Create development settings in config/settings/development.py:

   ```python
   from .base import *

   DEBUG = True

   # CORS settings for development
   INSTALLED_APPS += ['corsheaders']
   MIDDLEWARE.insert(2, 'corsheaders.middleware.CorsMiddleware')
   CORS_ALLOW_ALL_ORIGINS = True
   ```

4. Create production settings in config/settings/production.py:

   ```python
   from .base import *

   DEBUG = False

   # Security settings
   SECURE_BROWSER_XSS_FILTER = True
   SECURE_CONTENT_TYPE_NOSNIFF = True
   SECURE_HSTS_SECONDS = 31536000
   SECURE_HSTS_INCLUDE_SUBDOMAINS = True
   SECURE_HSTS_PRELOAD = True
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True

   # CORS settings
   INSTALLED_APPS += ['corsheaders']
   MIDDLEWARE.insert(2, 'corsheaders.middleware.CorsMiddleware')
   CORS_ALLOWED_ORIGINS = [
       'https://chatbot.instincthub.com',
   ]
   ```

5. Create wsgi.py file:

   ```python
   import os
   from django.core.wsgi import get_wsgi_application

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
   application = get_wsgi_application()
   ```

6. Create asgi.py file:

   ```python
   import os
   from django.core.asgi import get_asgi_application

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
   application = get_asgi_application()
   ```

7. Create urls.py file:

   ```python
   from django.contrib import admin
   from django.urls import path, include
   from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
       path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
       path('api/v1/', include('core.urls')),
   ]
   ```

### .3 Create Django Apps

1. Create core app:

   ```bash
   mkdir -p core/migrations
   touch core/__init__.py
   touch core/apps.py
   touch core/models.py
   touch core/urls.py
   touch core/views.py
   touch core/migrations/__init__.py
   ```

2. Configure core/apps.py:

   ```python
   from django.apps import AppConfig

   class CoreConfig(AppConfig):
       default_auto_field = 'django.db.models.BigAutoField'
       name = 'core'
   ```

3. Create documents app:

   ```bash
   mkdir -p documents/migrations
   touch documents/__init__.py
   touch documents/apps.py
   touch documents/models.py
   touch documents/serializers.py
   touch documents/urls.py
   touch documents/views.py
   touch documents/migrations/__init__.py
   ```

4. Configure documents/apps.py:

   ```python
   from django.apps import AppConfig

   class DocumentsConfig(AppConfig):
       default_auto_field = 'django.db.models.BigAutoField'
       name = 'documents'
   ```

5. Create knowledge_base app:

   ```bash
   mkdir -p knowledge_base/migrations
   touch knowledge_base/__init__.py
   touch knowledge_base/apps.py
   touch knowledge_base/models.py
   touch knowledge_base/services.py
   touch knowledge_base/migrations/__init__.py
   ```

6. Configure knowledge_base/apps.py:

   ```python
   from django.apps import AppConfig

   class KnowledgeBaseConfig(AppConfig):
       default_auto_field = 'django.db.models.BigAutoField'
       name = 'knowledge_base'
   ```

7. Create chat app:

   ```bash
   mkdir -p chat/migrations
   touch chat/__init__.py
   touch chat/apps.py
   touch chat/models.py
   touch chat/serializers.py
   touch chat/urls.py
   touch chat/views.py
   touch chat/migrations/__init__.py
   ```

8. Configure chat/apps.py:

   ```python
   from django.apps import AppConfig

   class ChatConfig(AppConfig):
       default_auto_field = 'django.db.models.BigAutoField'
       name = 'chat'
   ```

### .4 Create Celery Configuration

1. Create celery.py in config folder:

   ```bash
   touch config/celery.py
   ```

2. Add the following content:

   ```python
   import os
   from celery import Celery

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

   app = Celery('support_chatbot')
   app.config_from_object('django.conf:settings', namespace='CELERY')
   app.autodiscover_tasks()

   @app.task(bind=True, ignore_result=True)
   def debug_task(self, request):
       print(f'Request: {request!r}')
   ```

3. Update config/**init**.py to include Celery:

   ```python
   from .celery import app as celery_app

   __all__ = ('celery_app',)
   ```

## 4. Document Model Implementation

### 4.1 Create Document Models

1. Add the Document model in documents/models.py:

   ```python
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
   ```

### 4.2 Create Chat Models

1. Add the Conversation and Message models in chat/models.py:

   ```python
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
   ```

### 4.3 Create Widget Configuration Model

1. Add the Widget model in core/models.py:

   ```python
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
   ```

2. Create initial migrations:
   ```bash
   python manage.py makemigrations
   ```

## 2. Basic Django Project Structure

### 2.1 Create API Endpoints Structure

1. Create core/urls.py:

   ```python
   from django.urls import path, include

   urlpatterns = [
       path('documents/', include('documents.urls')),
       path('chat/', include('chat.urls')),
   ]
   ```

2. Create documents/urls.py:

   ```python
   from django.urls import path
   from . import views

   urlpatterns = [
       path('', views.DocumentListCreateView.as_view(), name='document-list-create'),
       path('<uuid:pk>/', views.DocumentRetrieveUpdateDestroyView.as_view(), name='document-detail'),
   ]
   ```

3. Create documents/views.py:

   ```python
   from rest_framework import generics, permissions
   from .models import Document
   from .serializers import DocumentSerializer

   class DocumentListCreateView(generics.ListCreateAPIView):
       queryset = Document.objects.all()
       serializer_class = DocumentSerializer
       permission_classes = [permissions.IsAuthenticated]

       def perform_create(self, serializer):
           serializer.save()
           # TODO: Trigger document processing task

   class DocumentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
       queryset = Document.objects.all()
       serializer_class = DocumentSerializer
       permission_classes = [permissions.IsAuthenticated]
   ```

4. Create documents/serializers.py:

   ```python
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
   ```

5. Create chat/urls.py:

   ```python
   from django.urls import path
   from . import views

   urlpatterns = [
       path('conversations/', views.ConversationListCreateView.as_view(), name='conversation-list-create'),
       path('conversations/<uuid:pk>/', views.ConversationRetrieveUpdateDestroyView.as_view(), name='conversation-detail'),
       path('conversations/<uuid:conversation_id>/messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
   ]
   ```

6. Create chat/views.py:

   ```python
   from rest_framework import generics, permissions
   from .models import Conversation, Message
   from .serializers import ConversationSerializer, MessageSerializer

   class ConversationListCreateView(generics.ListCreateAPIView):
       serializer_class = ConversationSerializer
       permission_classes = [permissions.IsAuthenticated]

       def get_queryset(self):
           return Conversation.objects.filter(user=self.request.user)

       def perform_create(self, serializer):
           serializer.save(user=self.request.user)

   class ConversationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
       serializer_class = ConversationSerializer
       permission_classes = [permissions.IsAuthenticated]

       def get_queryset(self):
           return Conversation.objects.filter(user=self.request.user)

   class MessageListCreateView(generics.ListCreateAPIView):
       serializer_class = MessageSerializer
       permission_classes = [permissions.IsAuthenticated]

       def get_queryset(self):
           conversation_id = self.kwargs.get('conversation_id')
           return Message.objects.filter(conversation__id=conversation_id,
                                        conversation__user=self.request.user)

       def perform_create(self, serializer):
           conversation_id = self.kwargs.get('conversation_id')
           conversation = Conversation.objects.get(id=conversation_id, user=self.request.user)
           serializer.save(conversation=conversation)
           # TODO: If message is from user, trigger response generation task
   ```

7. Create chat/serializers.py:

   ```python
   from rest_framework import serializers
   from .models import Conversation, Message

   class MessageSerializer(serializers.ModelSerializer):
       class Meta:
           model = Message
           fields = ['id', 'role', 'content', 'created_at']
           read_only_fields = ['id', 'created_at']

   class ConversationSerializer(serializers.ModelSerializer):
       messages = MessageSerializer(many=True, read_only=True)

       class Meta:
           model = Conversation
           fields = ['id', 'title', 'created_at', 'updated_at', 'messages']
           read_only_fields = ['id', 'created_at', 'updated_at']
   ```

### 2.2 Create Knowledge Base Service Structure

1. Create knowledge_base/services.py:

   ```python
   from documents.models import Document, Chunk, Embedding

   class DocumentProcessor:
       """Service for processing uploaded documents."""

       def __init__(self, document_id):
           self.document = Document.objects.get(id=document_id)

       def process(self):
           """Process a document by chunking and generating embeddings."""
           # TODO: Implement actual processing
           try:
               # 1. Extract text from document based on file type
               text = self._extract_text()

               # 2. Chunk the text
               chunks = self._chunk_text(text)

               # 3. Save chunks to database
               self._save_chunks(chunks)

               # 4. Generate embeddings for chunks
               self._generate_embeddings()

               # 5. Mark document as processed
               self.document.processed = True
               self.document.save()

           except Exception as e:
               self.document.processing_error = str(e)
               self.document.save()
               raise

       def _extract_text(self):
           """Extract text from document based on file type."""
           # TODO: Implement text extraction based on content_type
           return "Placeholder text extraction"

       def _chunk_text(self, text):
           """Chunk text into smaller pieces."""
           # TODO: Implement chunking strategy
           return [text]

       def _save_chunks(self, chunks):
           """Save chunks to database."""
           # TODO: Implement chunk saving
           for i, chunk_text in enumerate(chunks):
               Chunk.objects.create(
                   document=self.document,
                   content=chunk_text,
                   chunk_index=i
               )

       def _generate_embeddings(self):
           """Generate embeddings for all chunks."""
           # TODO: Implement embedding generation
           chunks = Chunk.objects.filter(document=self.document)
           for chunk in chunks:
               # Placeholder for actual embedding generation
               Embedding.objects.create(
                   chunk=chunk,
                   vector={},  # Placeholder
                   embedding_model="placeholder",
                   dimensions=1536
               )


   class RAGQueryEngine:
       """Service for retrieving relevant documents for a query."""

       def query(self, query_text, top_k=3):
           """
           Query the knowledge base for relevant chunks.

           Args:
               query_text: The query text
               top_k: Number of chunks to retrieve

           Returns:
               List of relevant chunks
           """
           # TODO: Implement actual RAG query
           # 1. Generate embedding for query
           # 2. Perform vector similarity search
           # 3. Return top-k relevant chunks

           # Placeholder implementation
           return Chunk.objects.all()[:top_k]
   ```

### 2.3 Create Tasks for Asynchronous Processing

1. Create documents/tasks.py:

   ```bash
   touch documents/tasks.py
   ```

2. Add the following content:

   ```python
   from celery import shared_task
   from knowledge_base.services import DocumentProcessor

   @shared_task
   def process_document(document_id):
       """Process a document asynchronously."""
       processor = DocumentProcessor(document_id)
       processor.process()
       return f"Document {document_id} processed successfully"
   ```

3. Update documents/views.py to trigger the task:

   ```python
   from rest_framework import generics, permissions, status
   from rest_framework.response import Response
   from .models import Document
   from .serializers import DocumentSerializer
   from .tasks import process_document

   class DocumentListCreateView(generics.ListCreateAPIView):
       queryset = Document.objects.all()
       serializer_class = DocumentSerializer
       permission_classes = [permissions.IsAuthenticated]

       def perform_create(self, serializer):
           document = serializer.save()
           # Trigger document processing task
           process_document.delay(str(document.id))

   class DocumentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
       queryset = Document.objects.all()
       serializer_class = DocumentSerializer
       permission_classes = [permissions.IsAuthenticated]
   ```
