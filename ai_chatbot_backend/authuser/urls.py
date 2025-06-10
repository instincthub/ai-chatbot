from django.urls import path
from authuser.views import SignupAPIView

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup-api"),
] 