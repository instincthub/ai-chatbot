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
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

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
             python-version: "3.10"

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
             node-version: "18"

         - name: Install dependencies
           run: |
             cd chatbot_frontend
             npm ci

         - name: Run chatbot_frontend linting
           run: |
             cd chatbot_frontend
             npm run lint

         - name: Run chatbot_frontend tests
           run: |
             cd chatbot_frontend
             npm test

     # Build and push docker images on main branch
     build-and-push:
       needs: [backend-test, chatbot_frontend-test]
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
