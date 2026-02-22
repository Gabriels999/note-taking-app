import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse

from api.cache import category_cache
from api.cache.category_cache import CATEGORY_CACHE_VERSION_KEY
from api.models import Category
from api.views import category as category_views


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


@pytest.mark.django_db
def test_categories_collection_uses_cached_payload(client, monkeypatch):
    cache.clear()
    user_model = get_user_model()
    user = user_model.objects.create_user("cached", password="strong-pass-123")
    client.force_login(user)

    first_response = client.get(reverse("categories-collection"))
    assert first_response.status_code == 200

    def fail_if_called(_):
        raise AssertionError(
            "Expected cached response, but service was called."
        )

    monkeypatch.setattr(
        category_views,
        "list_categories_for_user",
        fail_if_called,
    )

    second_response = client.get(reverse("categories-collection"))
    assert second_response.status_code == 200
    assert second_response.json() == first_response.json()


@pytest.mark.django_db
def test_category_create_bumps_categories_cache_version():
    cache.clear()
    cache.set(CATEGORY_CACHE_VERSION_KEY, 1)

    Category.objects.create(
        name="Drama",
        color="#A8C686",
        owner=None,
        is_default=False,
    )

    assert cache.get(CATEGORY_CACHE_VERSION_KEY) == 2


@pytest.mark.django_db
def test_bump_category_cache_version_falls_back_when_incr_not_supported(
    monkeypatch,
):
    cache.clear()
    cache.set(CATEGORY_CACHE_VERSION_KEY, 5)

    def raise_not_implemented(_):
        raise NotImplementedError

    monkeypatch.setattr(category_cache.cache, "incr", raise_not_implemented)

    category_cache.bump_category_cache_version()

    assert cache.get(CATEGORY_CACHE_VERSION_KEY) == 6
