from django.urls import path
from . import views

urlpatterns = [
    path('', views.DocumentListCreateView.as_view(), name='document-list-create'),
    path('<uuid:pk>/', views.DocumentRetrieveUpdateDestroyView.as_view(), name='document-detail'),
] 