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

### 2.3 Create Docker Compose Configuration

1. Navigate to the project root and create docker-compose.yml:

   ```bash
   cd ..
   touch docker-compose.yml
   ```

2. Add the following content to docker-compose.yml:

   ```yaml
   version: "3.8"

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
       build: ./chatbot_backend
       command: python manage.py runserver 0.0.0.0:8000
       volumes:
         - ./chatbot_backend:/app
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
       build: ./chatbot_backend
       command: celery -A config worker -l INFO
       volumes:
         - ./chatbot_backend:/app
       depends_on:
         - backend
         - redis
       environment:
         - DEBUG=1
         - DATABASE_URL=postgres://postgres:postgres@db:5432/supportbot
         - REDIS_URL=redis://redis:6379/0
         - SECRET_KEY=dev-secret-key-change-in-production
         - DJANGO_SETTINGS_MODULE=config.settings

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
   touch chatbot_backend/.env
   touch chatbot_backend/.env
   ```

2. Add environment variables to chatbot_backend/.env:

   ```
   DEBUG=1
   SECRET_KEY=dev-secret-key-change-in-production
   DATABASE_URL=postgres://postgres:postgres@db:5432/supportbot
   REDIS_URL=redis://redis:6379/0
   ```

3. Add environment variables to chatbot_frontend/.env:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Add .env files to .gitignore:
   ```bash
   echo "*.env" >> .gitignore
   ```
