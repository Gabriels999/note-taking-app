import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from api.models import Category


@pytest.mark.django_db
def test_categories_collection_requires_authentication(client):
    response = client.get(reverse("categories-collection"))

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


@pytest.mark.django_db
def test_categories_collection_returns_shared_and_user_owned_categories(
    client,
):
    user_model = get_user_model()
    user = user_model.objects.create_user("owner", password="strong-pass-123")
    other = user_model.objects.create_user("other", password="strong-pass-123")
    Category.objects.create(
        name="Work",
        color="#112233",
        owner=user,
        is_default=False,
    )
    Category.objects.create(
        name="Other private",
        color="#445566",
        owner=other,
        is_default=False,
    )
    client.force_login(user)

    response = client.get(reverse("categories-collection"))

    assert response.status_code == 200
    payload = response.json()
    names = [category["name"] for category in payload["categories"]]

    assert "Random Thoughts" in names
    assert "School" in names
    assert "Personal" in names
    assert "Work" in names
    assert "Other private" not in names
