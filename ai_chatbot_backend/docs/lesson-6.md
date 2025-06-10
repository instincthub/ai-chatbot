# Lesson 6: Connect Signup to DB

Create a signup APIView in authuser/views.py. that accept a POST request with a username, email, first name, last name, password, and password2 fields.

Return response with username, email, first name, last name and access token.

## Lesson Overview:

- In this lesson, we will add a signup form to the chatbot.
- We will use the `django.contrib.auth` app to handle user registration.
- We will use the `django.contrib.auth.views` to handle the signup form.

## Create Signup Form

- Create authuser app with `python manage.py startapp authuser`
- Add `AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']` to `settings.py`
- Add `INSTALLED_APPS = ['authuser']` to `settings.py`
- Add `from django.contrib.auth.models import User` to `authuser/models.py`

### Add URL

- create `authuser/urls.py` and add url pattern

```python
from django.urls import path
from authuser.views import SignupAPIView

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup-api"),
]
```

- add `path('signup/', SignupAPIView.as_view(), name='signup')` to `authuser/urls.py`
- add authuser.urls to ai_chatbot_backend/urls.py

```
from django.urls import include
path('api/v1/authuser/', include('authuser.urls')),
```
