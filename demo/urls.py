from django.urls import path

from demo import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('sign-up/', views.signup, name='sign-up'),
]
