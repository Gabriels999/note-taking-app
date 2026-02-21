from django.urls import path

from api import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("auth/csrf/", views.csrf_cookie, name="csrf-cookie"),
    path("auth/login/", views.APILoginView.as_view(), name="auth-login"),
    path("auth/signup/", views.signup, name="auth-signup"),
]
