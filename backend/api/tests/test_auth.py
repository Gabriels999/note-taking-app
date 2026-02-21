import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse


@pytest.mark.django_db
def test_login_success_sets_session(client):
    user_model = get_user_model()
    user_model.objects.create_user(
        username="alice", password="strong-pass-123"
    )

    response = client.post(
        reverse("auth-login"),
        {"username": "alice", "password": "strong-pass-123"},
    )

    assert response.status_code == 200
    assert response.json() == {"detail": "Login successful"}
    assert client.session.get("_auth_user_id") is not None


@pytest.mark.django_db
def test_login_invalid_credentials(client):
    response = client.post(
        reverse("auth-login"),
        {"username": "alice", "password": "wrong-password"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid credentials"


@pytest.mark.django_db
def test_csrf_cookie_endpoint(client):
    response = client.get(reverse("csrf-cookie"))

    assert response.status_code == 200
    assert response.json() == {"detail": "CSRF cookie set"}
    assert "csrftoken" in response.cookies


@pytest.mark.django_db
def test_login_get_not_allowed(client):
    response = client.get(reverse("auth-login"))

    assert response.status_code == 405


@pytest.mark.django_db
def test_signup_success_creates_user_and_sets_session(client):
    response = client.post(
        reverse("auth-signup"),
        {
            "username": "new-user",
            "password1": "StrongPassword-123",
            "password2": "StrongPassword-123",
        },
    )

    assert response.status_code == 201
    assert response.json() == {"detail": "Signup successful"}
    assert client.session.get("_auth_user_id") is not None

    user_model = get_user_model()
    assert user_model.objects.filter(username="new-user").exists()


@pytest.mark.django_db
def test_signup_duplicate_username_fails(client):
    user_model = get_user_model()
    user_model.objects.create_user(
        username="new-user", password="StrongPassword-123"
    )

    response = client.post(
        reverse("auth-signup"),
        {
            "username": "new-user",
            "password1": "StrongPassword-123",
            "password2": "StrongPassword-123",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Signup failed"


@pytest.mark.django_db
def test_signup_get_not_allowed(client):
    response = client.get(reverse("auth-signup"))

    assert response.status_code == 405
