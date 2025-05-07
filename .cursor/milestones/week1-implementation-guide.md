# Week 1 Implementation Guide: Project Setup and Knowledge Base Foundation

This guide provides detailed steps for implementing the first week of the Customer Support Chatbot project. By the end of this week, you'll have established the project foundation including repository structure, development environment, database models, and initial application scaffolding.

## 1. Project Repository Initialization

### 1.1 Set Up GitHub Repository

1. Create a new repository on GitHub
   ```bash
   # Repository name: support-chatbot-rag
   # Visibility: Private
   # Add README.md, .gitignore (Python, Node), and LICENSE
   ```

2. Clone the repository locally
   ```bash
   git clone https://github.com/yourusername/support-chatbot-rag.git
   cd support-chatbot-rag
   ```

3. Create the basic project structure
   ```bash
   mkdir -p backend frontend docs infrastructure
   touch README.md
   ```

4. Create an initial README.md with project overview
   ```markdown
   # Customer Support Chatbot with RAG

   A specialized customer support chatbot that leverages company documents to provide accurate responses. The system uses Retrieval Augmented Generation (RAG) to pull relevant information from the knowledge base before generating answers.

   ## Project Structure

   - `/backend` - Django 5.2 application
   - `/frontend` - Next.js 15.3 application
   - `/docs` - Project documentation
   - `/infrastructure` - Docker and deployment configurations
   ```

5. Push initial structure to the repository
   ```bash
   git add .
   git commit -m "Initialize project structure"
   git push origin main
   ```

6. Create development branch
   ```bash
   git checkout -b develop
   git push origin develop
   ```

### 1.2 Set Up Branch Protection Rules

1. Go to repository Settings > Branches
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## 2. Development Environment Setup with Docker

### 2.1 Create Docker Configuration for Backend

1. Create Dockerfile for Django backend:
   ```bash
   cd backend
   touch Dockerfile
   ```

2. Add the following content to the Dockerfile:
   ```dockerfile
   FROM python:3.10-slim

   ENV PYTHONDONTWRITEBYTECODE 1
   ENV PYTHONUNBUFFERED 1
   ENV DJANGO_SETTINGS_MODULE=config.settings

   WORKDIR /app

   # Install system dependencies
   RUN apt-get update && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       && apt-get clean \
       && rm -rf /var/lib/apt/lists/*

   # Install Python dependencies
   COPY requirements.txt .
   RUN pip install --upgrade pip && pip install -r requirements.txt

   # Copy project
   COPY . .

   # Run server
   CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
   ```

3. Create requirements.txt file:
   ```bash
   touch requirements.txt
   ```

4. Add dependencies to requirements.txt:
   ```
   Django==5.2
   djangorestframework==3.14.0
   psycopg2==2.9.6
   langchain==0.1.0
   celery==5.3.1
   redis==5.0.1
   drf-spectacular==0.26.4
   djangorestframework-simplejwt==5.3.0
   python-dotenv==1.0.0
   gunicorn==21.2.0
   whitenoise==6.5.0
   pytest==7.4.0
   pytest-django==4.5.2
   flake8==6.1.0
   black==23.7.0
   mypy==1.5.1
   ```

### 2.2 Create Docker Configuration for Frontend

1. Create Dockerfile for Next.js frontend:
   ```bash
   cd ../frontend
   touch Dockerfile
   ```

2. Add the following content to the Dockerfile:
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app

   # Install dependencies
   COPY package.json package-lock.json* ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   # Build the project
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production

   # Copy built assets from the builder stage
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   # Start Next.js
   CMD ["npm", "start"]
   ```

### 2.3 Create Docker Compose Configuration

1. Navigate to the project root and create docker-compose.yml:
   ```bash
   cd ..
   touch docker-compose.yml
   ```

2. Add the following content to docker-compose.yml:
   ```yaml
   version: '3.8'

   services:
     db:
       image: postgres:15
       volumes:
         - postgres_data:/var/lib/postgresql/data/
       environment:
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_USER=postgres
         - POSTGRES_DB=supportbot
       ports:
         - "5432:5432"
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 5s
         timeout: 5s
         retries: 5

     pgvector-setup:
       image: postgres:15
       depends_on:
         db:
           condition: service_healthy
       volumes:
         - ./infrastructure/postgres:/docker-entrypoint-initdb.d/
       command: >
         bash -c "
           PGPASSWORD=postgres psql -h db -U postgres -d supportbot -c 'CREATE EXTENSION IF NOT EXISTS vector;'
         "

     redis:
       image: redis:7
       ports:
         - "6379:6379"

     backend:
       build: ./backend
       command: python manage.py runserver 0.0.0.0:8000
       volumes:
         - ./backend:/app
       ports:
         - "8000:8000"
       depends_on:
         db:
           condition: service_healthy
         pgvector-setup:
           condition: service_completed_successfully
         redis:
           condition: service_started
       environment:
         - DEBUG=1
         - DATABASE_URL=postgres://postgres:postgres@db:5432/supportbot
         - REDIS_URL=redis://redis:6379/0
         - SECRET_KEY=dev-secret-key-change-in-production
         - DJANGO_SETTINGS_MODULE=config.settings

     celery:
       build: ./backend
       command: celery -A config worker -l INFO
       volumes:
         - ./backend:/app
       depends_on:
         - backend
         - redis
       environment:
         - DEBUG=1
         - DATABASE_URL=postgres://postgres:postgres@db:5432/supportbot
         - REDIS_URL=redis://redis:6379/0
         - SECRET_KEY=dev-secret-key-change-in-production
         - DJANGO_SETTINGS_MODULE=config.settings

     frontend:
       build: ./frontend
       command: npm run dev
       volumes:
         - ./frontend:/app
         - /app/node_modules
         - /app/.next
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=development
         - NEXT_PUBLIC_API_URL=http://localhost:8000/api

   volumes:
     postgres_data:
   ```

3. Create a folder for PostgreSQL setup scripts:
   ```bash
   mkdir -p infrastructure/postgres
   touch infrastructure/postgres/01-init-pgvector.sql
   ```

4. Add pgvector setup script:
   ```sql
   -- infrastructure/postgres/01-init-pgvector.sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 2.4 Add Environment Configuration

1. Create .env files for both environments:
   ```bash
   touch backend/.env
   touch frontend/.env
   ```

2. Add environment variables to backend/.env:
   ```
   DEBUG=1
   SECRET_KEY=dev-secret-key-change-in-production
   DATABASE_URL=postgres://postgres:postgres@db:5432/supportbot
   REDIS_URL=redis://redis:6379/0
   ```

3. Add environment variables to frontend/.env:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Add .env files to .gitignore:
   ```bash
   echo "*.env" >> .gitignore
   ```

## 3. Database Schema Design and Initial Migrations

### 3.1 Design Core Database Schema

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

### 3.2 Initialize Django Project

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
       'https://your-frontend-domain.com',
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

### 3.3 Create Django Apps

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

### 3.4 Create Celery Configuration

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

3. Update config/__init__.py to include Celery:
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

### 4.4. Create Initial Migrations

1. Create an entry point Django file:
   ```bash
   touch manage.py
   ```

2. Add the following content to manage.py:
   ```python
   #!/usr/bin/env python
   """Django's command-line utility for administrative tasks."""
   import os
   import sys

   def main():
       """Run administrative tasks."""
       os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
       try:
           from django.core.management import execute_from_command_line
       except ImportError as exc:
           raise ImportError(
               "Couldn't import Django. Are you sure it's installed?"
           ) from exc
       execute_from_command_line(sys.argv)

   if __name__ == '__main__':
       main()
   ```

3. Make it executable:
   ```bash
   chmod +x manage.py
   ```

4. Create a custom migration for pgvector extension:
   ```bash
   mkdir -p knowledge_base/migrations
   touch knowledge_base/migrations/0001_add_pgvector_extension.py
   ```

5. Add the following content:
   ```python
   from django.db import migrations

   class Migration(migrations.Migration):
       operations = [
           migrations.RunSQL(
               "CREATE EXTENSION IF NOT EXISTS vector;",
               "DROP EXTENSION IF EXISTS vector;"
           ),
       ]
   ```

6. Create initial migrations:
   ```bash
   python manage.py makemigrations
   ```

## 5. Basic Django Project Structure

### 5.1 Create API Endpoints Structure

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

### 5.2 Create Knowledge Base Service Structure

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

### 5.3 Create Tasks for Asynchronous Processing

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

## 6. Next.js Project Scaffolding

### 6.1 Initialize Next.js Project

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Initialize Next.js project:
   ```bash
   npx create-next-app@latest . --typescript --app --eslint
   ```

3. Install required dependencies:
   ```bash
   npm install @instincthub/react-ui axios jwt-decode react-markdown react-hook-form
   ```

4. Create project structure:
   ```bash
   mkdir -p app/api
   mkdir -p app/(auth)
   mkdir -p app/(main)
   mkdir -p app/(widget)
   mkdir -p components/ui
   mkdir -p components/chat
   mkdir -p components/documents
   mkdir -p components/widget
   mkdir -p lib/api
   mkdir -p lib/auth
   mkdir -p lib/utils
   ```

### 6.2 Configure TypeScript

1. Update tsconfig.json with proper paths:
   ```json
   {
     "compilerOptions": {
       "target": "es5",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "preserve",
       "incremental": true,
       "plugins": [
         {
           "name": "next"
         }
       ],
       "paths": {
         "@/*": ["./*"],
         "@/components/*": ["./components/*"],
         "@/lib/*": ["./lib/*"],
         "@/types/*": ["./types/*"]
       }
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
     "exclude": ["node_modules"]
   }
   ```

2. Create types directory and define types:
   ```bash
   mkdir -p types
   touch types/index.ts
   ```

3. Add base types in types/index.ts:
   ```typescript
   // API Response Types
   export interface ApiResponse<T> {
     data: T;
     message?: string;
     status: string;
   }

   // Document Types
   export interface Document {
     id: string;
     title: string;
     description: string;
     file: string;
     content_type: string;
     file_size: number;
     created_at: string;
     updated_at: string;
     processed: boolean;
     processing_error: string;
   }

   // Chat Types
   export interface Message {
     id: string;
     role: 'user' | 'assistant' | 'system';
     content: string;
     created_at: string;
   }

   export interface Conversation {
     id: string;
     title: string;
     created_at: string;
     updated_at: string;
     messages: Message[];
   }

   // Widget Types
   export interface WidgetConfiguration {
     id: string;
     name: string;
     primary_color: string;
     title: string;
     welcome_message: string;
     allowed_domains: string;
     enable_file_upload: boolean;
     enable_feedback: boolean;
     created_at: string;
     updated_at: string;
     conversation_count: number;
   }

   // User Types
   export interface User {
     id: string;
     email: string;
     first_name: string;
     last_name: string;
   }

   // Auth Types
   export interface AuthState {
     isAuthenticated: boolean;
     user: User | null;
     loading: boolean;
   }
   ```

### 6.3 Create API Client

1. Create API client in lib/api/client.ts:
   ```typescript
   import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

   // Create axios instance
   const apiClient: AxiosInstance = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add request interceptor for authentication
   apiClient.interceptors.request.use(
     (config) => {
       // Get token from localStorage in client-side context
       if (typeof window !== 'undefined') {
         const token = localStorage.getItem('accessToken');
         if (token && config.headers) {
           config.headers.Authorization = `Bearer ${token}`;
         }
       }
       return config;
     },
     (error) => Promise.reject(error)
   );

   // Add response interceptor for error handling
   apiClient.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       // Handle token refresh logic here if needed
       if (error.response?.status === 401 && !originalRequest._retry) {
         // Token refresh logic would go here
       }
       
       return Promise.reject(error);
     }
   );

   export default apiClient;
   ```

2. Create API services in lib/api/services.ts:
   ```typescript
   import apiClient from './client';
   import { Document, Conversation, Message, WidgetConfiguration } from '@/types';
   import { ApiResponse } from '@/types';

   // Documents API
   export const documentsApi = {
     getAll: () => apiClient.get<ApiResponse<Document[]>>('/documents/'),
     get: (id: string) => apiClient.get<ApiResponse<Document>>(`/documents/${id}/`),
     create: (data: FormData) => apiClient.post<ApiResponse<Document>>('/documents/', data, {
       headers: {
         'Content-Type': 'multipart/form-data',
       },
     }),
     update: (id: string, data: Partial<Document>) => 
       apiClient.patch<ApiResponse<Document>>(`/documents/${id}/`, data),
     delete: (id: string) => apiClient.delete(`/documents/${id}/`),
   };

   // Conversations API
   export const conversationsApi = {
     getAll: () => apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations/'),
     get: (id: string) => apiClient.get<ApiResponse<Conversation>>(`/chat/conversations/${id}/`),
     create: (data: Partial<Conversation>) => 
       apiClient.post<ApiResponse<Conversation>>('/chat/conversations/', data),
     update: (id: string, data: Partial<Conversation>) => 
       apiClient.patch<ApiResponse<Conversation>>(`/chat/conversations/${id}/`, data),
     delete: (id: string) => apiClient.delete(`/chat/conversations/${id}/`),
   };

   // Messages API
   export const messagesApi = {
     getAll: (conversationId: string) => 
       apiClient.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/messages/`),
     create: (conversationId: string, data: Partial<Message>) => 
       apiClient.post<ApiResponse<Message>>(`/chat/conversations/${conversationId}/messages/`, data),
   };

   // Widget API
   export const widgetApi = {
     getAll: () => apiClient.get<ApiResponse<WidgetConfiguration[]>>('/widgets/'),
     get: (id: string) => apiClient.get<ApiResponse<WidgetConfiguration>>(`/widgets/${id}/`),
     create: (data: Partial<WidgetConfiguration>) => 
       apiClient.post<ApiResponse<WidgetConfiguration>>('/widgets/', data),
     update: (id: string, data: Partial<WidgetConfiguration>) => 
       apiClient.patch<ApiResponse<WidgetConfiguration>>(`/widgets/${id}/`, data),
     delete: (id: string) => apiClient.delete(`/widgets/${id}/`),
   };

   // Auth API
   export const authApi = {
     login: (email: string, password: string) => 
       apiClient.post<ApiResponse<{ access: string, refresh: string }>>('/auth/login/', { email, password }),
     register: (userData: { email: string, password: string, first_name: string, last_name: string }) => 
       apiClient.post<ApiResponse<{ user: any, access: string, refresh: string }>>('/auth/register/', userData),
     getUser: () => apiClient.get<ApiResponse<any>>('/auth/user/'),
     refreshToken: (refresh: string) => 
       apiClient.post<ApiResponse<{ access: string }>>('/auth/token/refresh/', { refresh }),
   };
   ```

### 6.4 Create Base Layout

1. Create the root layout in app/layout.tsx:
   ```tsx
   import '@/styles/globals.css'
   import type { Metadata } from 'next'

   export const metadata: Metadata = {
     title: 'Customer Support Chatbot',
     description: 'AI-powered customer support chatbot with RAG',
   }

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en">
         <body>
           {children}
         </body>
       </html>
     )
   }
   ```

2. Create the auth layout in app/(auth)/layout.tsx:
   ```tsx
   export default function AuthLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
         <div className="ihub-w-full ihub-max-w-md ihub-p-8 ihub-bg-white ihub-rounded-lg ihub-shadow-lg">
           {children}
         </div>
       </div>
     )
   }
   ```

3. Create the main layout in app/(main)/layout.tsx:
   ```tsx
   export default function MainLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col">
         <header className="ihub-bg-blue-600 ihub-text-white ihub-p-4">
           <div className="ihub-container ihub-mx-auto ihub-flex ihub-justify-between ihub-items-center">
             <h1 className="ihub-text-xl ihub-font-bold">Support Chatbot Admin</h1>
             <nav>
               {/* Nav items will go here */}
             </nav>
           </div>
         </header>
         <main className="ihub-flex-1 ihub-container ihub-mx-auto ihub-p-4">
           {children}
         </main>
         <footer className="ihub-bg-gray-100 ihub-p-4 ihub-text-center ihub-text-gray-500">
           <div className="ihub-container ihub-mx-auto">
             &copy; {new Date().getFullYear()} Support Chatbot
           </div>
         </footer>
       </div>
     )
   }
   ```

4. Create the widget layout in app/(widget)/layout.tsx:
   ```tsx
   export default function WidgetLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <div className="ihub-flex ihub-flex-col ihub-min-h-screen ihub-max-h-screen ihub-overflow-hidden">
         {children}
       </div>
     )
   }
   ```

### 6.5 Create Basic Pages

1. Create the homepage in app/page.tsx:
   ```tsx
   import Link from 'next/link';

   export default function Home() {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
         <div className="ihub-text-center ihub-max-w-2xl ihub-p-8">
           <h1 className="ihub-text-4xl ihub-font-bold ihub-mb-4">Customer Support Chatbot</h1>
           <p className="ihub-text-xl ihub-mb-8">
             AI-powered support chatbot that leverages your company documents to provide accurate responses.
           </p>
           <div className="ihub-flex ihub-gap-4 ihub-justify-center">
             <Link href="/login" className="ihub-bg-blue-600 ihub-text-white ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-blue-700">
               Login
             </Link>
             <Link href="/chat" className="ihub-bg-gray-200 ihub-text-gray-800 ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-gray-300">
               Try Demo
             </Link>
           </div>
         </div>
       </div>
     );
   }
   ```

2. Create login page in app/(auth)/login/page.tsx:
   ```tsx
   'use client';

   import { useState } from 'react';
   import { useRouter } from 'next/navigation';
   import Link from 'next/link';

   export default function Login() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       setError('');
       
       try {
         // Auth logic will be implemented here
         // For now, just redirect to dashboard
         router.push('/dashboard');
       } catch (err: any) {
         setError(err.message || 'Failed to login');
       } finally {
         setLoading(false);
       }
     };

     return (
       <>
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-6 ihub-text-center">Login</h1>
         
         {error && (
           <div className="ihub-bg-red-100 ihub-text-red-700 ihub-p-3 ihub-rounded ihub-mb-4">
             {error}
           </div>
         )}
         
         <form onSubmit={handleSubmit}>
           <div className="ihub-mb-4">
             <label className="ihub-block ihub-text-gray-700 ihub-mb-2" htmlFor="email">
               Email
             </label>
             <input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="ihub-w-full ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
               required
             />
           </div>
           
           <div className="ihub-mb-6">
             <label className="ihub-block ihub-text-gray-700 ihub-mb-2" htmlFor="password">
               Password
             </label>
             <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="ihub-w-full ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
               required
             />
           </div>
           
           <button
             type="submit"
             disabled={loading}
             className="ihub-w-full ihub-bg-blue-600 ihub-text-white ihub-p-2 ihub-rounded ihub-font-medium ihub-hover:bg-blue-700 disabled:ihub-opacity-50"
           >
             {loading ? 'Logging in...' : 'Login'}
           </button>
         </form>
         
         <div className="ihub-mt-4 ihub-text-center ihub-text-sm">
           Don&apos;t have an account?{' '}
           <Link href="/register" className="ihub-text-blue-600 ihub-hover:underline">
             Register
           </Link>
         </div>
       </>
     );
   }
   ```

3. Create a basic dashboard page in app/(main)/dashboard/page.tsx:
   ```tsx
   'use client';
   
   export default function Dashboard() {
     return (
       <div>
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-6">Dashboard</h1>
         
         <div className="ihub-grid ihub-grid-cols-1 md:ihub-grid-cols-3 ihub-gap-6">
           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">Documents</h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
             <p className="ihub-mt-2 ihub-text-gray-500">Total documents in knowledge base</p>
           </div>
           
           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">Conversations</h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
             <p className="ihub-mt-2 ihub-text-gray-500">Total chat conversations</p>
           </div>
           
           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">Widgets</h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">0</p>
             <p className="ihub-mt-2 ihub-text-gray-500">Active chat widgets</p>
           </div>
         </div>
       </div>
     );
   }
   ```

4. Create a basic chat page in app/(main)/chat/page.tsx:
   ```tsx
   'use client';
   
   export default function ChatPage() {
     return (
       <div className="ihub-flex ihub-flex-col ihub-h-[calc(100vh-9rem)]">
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-4">Chat</h1>
         
         <div className="ihub-flex ihub-flex-row ihub-h-full ihub-gap-4">
           <div className="ihub-w-1/4 ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-p-4 ihub-overflow-y-auto">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-4">Conversations</h2>
             <div className="ihub-flex ihub-justify-between ihub-items-center ihub-mb-4">
               <input
                 type="text"
                 placeholder="Search conversations..."
                 className="ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded ihub-w-full"
               />
             </div>
             <p className="ihub-text-gray-500 ihub-text-center ihub-mt-6">No conversations yet</p>
           </div>
           
           <div className="ihub-flex-1 ihub-flex ihub-flex-col ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-overflow-hidden">
             <div className="ihub-p-4 ihub-border-b ihub-font-semibold">
               New Conversation
             </div>
             
             <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
               <div className="ihub-flex ihub-flex-col ihub-gap-4">
                 <p className="ihub-text-gray-500 ihub-text-center ihub-my-8">
                   Start a new conversation by typing a message below.
                 </p>
               </div>
             </div>
             
             <div className="ihub-border-t ihub-p-4">
               <div className="ihub-flex ihub-gap-2">
                 <input
                   type="text"
                   placeholder="Type your message..."
                   className="ihub-flex-1 ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
                 />
                 <button className="ihub-bg-blue-600 ihub-text-white ihub-px-4 ihub-py-2 ihub-rounded ihub-font-medium ihub-hover:ihub-bg-blue-700">
                   Send
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
   }
   ```

5. Create a basic widget preview page in app/(widget)/widget/[id]/page.tsx:
   ```tsx
   'use client';
   
   interface Params {
     params: {
       id: string;
     };
   }
   
   export default function WidgetPreview({ params }: Params) {
     const { id } = params;
     
     return (
       <div className="ihub-flex ihub-flex-col ihub-h-screen ihub-bg-white">
         <div className="ihub-p-3 ihub-bg-blue-600 ihub-text-white ihub-text-center">
           <h1 className="ihub-text-lg ihub-font-semibold">Support Chat</h1>
         </div>
         
         <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
           <div className="ihub-mb-4 ihub-bg-gray-100 ihub-rounded-lg ihub-p-3 ihub-max-w-xs">
             <p>Hello! How can I help you today?</p>
           </div>
         </div>
         
         <div className="ihub-p-3 ihub-border-t">
           <div className="ihub-flex ihub-gap-2">
             <input
               type="text"
               placeholder="Type your message..."
               className="ihub-flex-1 ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
             />
             <button className="ihub-bg-blue-600 ihub-text-white ihub-px-4 ihub-py-2 ihub-rounded ihub-font-medium ihub-hover:ihub-bg-blue-700">
               Send
             </button>
           </div>
         </div>
       </div>
     );
   }
   ```

### 6.6 Create Widget Embed Script

1. Create a widget embed script in public/widget.js:
   ```bash
   mkdir -p public
   touch public/widget.js
   ```

2. Add the following content:
   ```javascript
   (function() {
     // Configuration
     const config = {
       widgetId: 'WIDGET_ID', // Will be replaced when script is generated
       baseUrl: 'WIDGET_BASE_URL', // Will be replaced when script is generated
     };
     
     // Create widget container
     function createWidget() {
       // Create widget container
       const container = document.createElement('div');
       container.id = 'support-chatbot-widget-container';
       container.style.position = 'fixed';
       container.style.bottom = '20px';
       container.style.right = '20px';
       container.style.zIndex = '9999';
       
       // Create widget iframe
       const iframe = document.createElement('iframe');
       iframe.id = 'support-chatbot-widget-iframe';
       iframe.src = `${config.baseUrl}/widget/${config.widgetId}`;
       iframe.style.border = 'none';
       iframe.style.width = '350px';
       iframe.style.height = '500px';
       iframe.style.borderRadius = '10px';
       iframe.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
       iframe.style.display = 'none';
       
       // Create toggle button
       const button = document.createElement('button');
       button.id = 'support-chatbot-widget-button';
       button.innerHTML = `
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
         </svg>
       `;
       button.style.width = '60px';
       button.style.height = '60px';
       button.style.borderRadius = '50%';
       button.style.backgroundColor = '#2563EB';
       button.style.color = 'white';
       button.style.border = 'none';
       button.style.cursor = 'pointer';
       button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
       button.style.display = 'flex';
       button.style.alignItems = 'center';
       button.style.justifyContent = 'center';
       
       // Toggle widget visibility on button click
       button.addEventListener('click', function() {
         if (iframe.style.display === 'none') {
           iframe.style.display = 'block';
           button.innerHTML = `
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
             </svg>
           `;
         } else {
           iframe.style.display = 'none';
           button.innerHTML = `
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
             </svg>
           `;
         }
       });
       
       // Append elements to container
       container.appendChild(iframe);
       container.appendChild(button);
       
       // Append container to body
       document.body.appendChild(container);
     }
     
     // Initialize widget
     function init() {
       if (document.readyState === 'complete') {
         createWidget();
       } else {
         window.addEventListener('load', createWidget);
       }
     }
     
     // Start initialization
     init();
   })();
   ```

## 7. Initial CI/CD Pipeline Configuration

### 7.1 Create GitHub Actions Workflow

1. Create GitHub Actions workflow directory:
   ```bash
   mkdir -p .github/workflows
   ```

2. Create CI workflow file:
   ```bash
   touch .github/workflows/ci.yml
   ```

3. Add the following content:
   ```yaml
   name: CI Pipeline

   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]

   jobs:
     # Backend tests
     backend-test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:15
           env:
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgres
             POSTGRES_DB: test_db
           ports:
             - 5432:5432
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
         redis:
           image: redis
           ports:
             - 6379:6379
           options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5
       
       steps:
       - uses: actions/checkout@v2
       
       - name: Set up Python
         uses: actions/setup-python@v2
         with:
           python-version: '3.10'
       
       - name: Install dependencies
         run: |
           cd backend
           python -m pip install --upgrade pip
           pip install -r requirements.txt
       
       - name: Run backend tests
         run: |
           cd backend
           python manage.py test
         env:
           DEBUG: 1
           SECRET_KEY: test-key
           DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
           REDIS_URL: redis://localhost:6379/0

     # Frontend tests
     frontend-test:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v2
       
       - name: Set up Node.js
         uses: actions/setup-node@v2
         with:
           node-version: '18'
       
       - name: Install dependencies
         run: |
           cd frontend
           npm ci
       
       - name: Run frontend linting
         run: |
           cd frontend
           npm run lint
       
       - name: Run frontend tests
         run: |
           cd frontend
           npm test
       
     # Build and push docker images on main branch
     build-and-push:
       needs: [backend-test, frontend-test]
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v2
       
       # For now, we're just showing the step but not actually pushing
       - name: Build and push Docker images
         run: |
           echo "This is where we would build and push Docker images"
           echo "This will be implemented in a later phase"
   ```

### 7.2 Create Local Development Scripts

1. Create a scripts directory:
   ```bash
   mkdir -p scripts
   ```

2. Create setup script:
   ```bash
   touch scripts/setup.sh
   chmod +x scripts/setup.sh
   ```

3. Add the following content:
   ```bash
   #!/bin/bash

   # Setup script for local development

   # Ensure we're in the project root
   cd "$(dirname "$0")/.."

   # Check for Docker
   if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
       echo "Error: Docker and Docker Compose are required but not installed."
       echo "Please install Docker Desktop (Mac/Windows) or Docker Engine and Docker Compose (Linux)."
       exit 1
   fi

   # Build and start containers
   echo "Building and starting Docker containers..."
   docker-compose build
   docker-compose up -d

   # Run migrations
   echo "Running database migrations..."
   docker-compose exec backend python manage.py migrate

   # Create superuser if it doesn't exist
   echo "Checking for superuser..."
   docker-compose exec backend python -c "
   from django.contrib.auth import get_user_model;
   User = get_user_model();
   if not User.objects.filter(username='admin').exists():
       User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
       print('Superuser created!');
   else:
       print('Superuser already exists.');
   "

   echo "Setup complete! Your development environment is ready."
   echo ""
   echo "Frontend: http://localhost:3000"
   echo "Backend API: http://localhost:8000/api/v1"
   echo "Admin Interface: http://localhost:8000/admin"
   echo ""
   echo "Admin credentials:"
   echo "Username: admin"
   echo "Password: adminpassword"
   ```

4. Create a development script:
   ```bash
   touch scripts/dev.sh
   chmod +x scripts/dev.sh
   ```

5. Add the following content:
   ```bash
   #!/bin/bash

   # Development script for local development

   # Ensure we're in the project root
   cd "$(dirname "$0")/.."

   # Start containers in foreground
   docker-compose up
   ```

### 7.3 Update Project README

1. Update the README.md file with development instructions:
   ```markdown
   # Customer Support Chatbot with RAG

   A specialized customer support chatbot that leverages company documents to provide accurate responses. The system uses Retrieval Augmented Generation (RAG) to pull relevant information from the knowledge base before generating answers.

   ## Technology Stack

   - **Frontend**: Next.js 15.3
   - **Backend**: Django 5.2
   - **Database**: PostgreSQL with pgvector
   - **LLM**: Llama 3 with OpenAI fallback
   - **Deployment**: Vercel (frontend) and DigitalOcean (backend)

   ## Development Setup

   ### Prerequisites

   - Docker and Docker Compose
   - Git

   ### Getting Started

   1. Clone the repository:
      ```
      git clone https://github.com/yourusername/support-chatbot-rag.git
      cd support-chatbot-rag
      ```

   2. Run the setup script:
      ```
      ./scripts/setup.sh
      ```

   3. Start the development environment:
      ```
      ./scripts/dev.sh
      ```

   4. Access the applications:
      - Frontend: http://localhost:3000
      - Backend API: http://localhost:8000/api/v1
      - API Documentation: http://localhost:8000/api/docs/
      - Admin Interface: http://localhost:8000/admin

   ### Development Workflow

   1. Create a feature branch from `develop`:
      ```
      git checkout develop
      git pull
      git checkout -b feature/your-feature-name
      ```

   2. Make your changes and commit them:
      ```
      git add .
      git commit -m "Description of your changes"
      ```

   3. Push your branch and create a pull request:
      ```
      git push -u origin feature/your-feature-name
      ```

   4. Once reviewed and approved, your changes will be merged into `develop`.

   ## Project Structure

   - `/backend` - Django 5.2 application
   - `/frontend` - Next.js 15.3 application
   - `/docs` - Project documentation
   - `/infrastructure` - Docker and deployment configurations
   - `/scripts` - Development and utility scripts

   ## License

   [Specify your license here]
   ```

## 8. Commit and Push Changes

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Week 1: Project setup and knowledge base foundation"
   ```

2. Push to the repository:
   ```bash
   git push origin develop
   ```

## 9. Week 1 Deliverables Verification

Before considering Week 1 complete, verify that all required deliverables are in place:

- [x] Project repository initialized with proper structure
- [x] Docker development environment configured
- [x] Database schema designed and initial migrations created
- [x] Document models implemented
- [x] Basic Django project structure set up
- [x] Next.js project scaffolded
- [x] Initial CI/CD pipeline configuration

All these components provide the foundation for the Customer Support Chatbot project and set the stage for Week 2, where you'll implement the document processing pipeline.
