from django.urls import path
from authuser.views import SignupAPIView, LoginAPIView

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup-api"),
    path("login/", LoginAPIView.as_view(), name="login-api"),
] 