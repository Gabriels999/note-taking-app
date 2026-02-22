import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from api.admin import CategoryAdmin
from api.models import Category


@pytest.mark.django_db
def test_category_admin_blocks_delete_for_default_category():
    user_model = get_user_model()
    admin_user = user_model.objects.create_superuser(
        username="admin-user",
        email="admin@example.com",
        password="strong-pass-123",
    )
    default_category = Category.objects.create(
        name="Default Category",
        color="#111111",
        is_default=True,
    )

    site = AdminSite()
    admin_obj = CategoryAdmin(Category, site)
    request = RequestFactory().get("/admin/api/category/")
    request.user = admin_user

    assert (
        admin_obj.has_delete_permission(request, obj=default_category) is False
    )


@pytest.mark.django_db
def test_category_admin_allows_delete_for_non_default_category():
    user_model = get_user_model()
    admin_user = user_model.objects.create_superuser(
        username="admin-user-2",
        email="admin2@example.com",
        password="strong-pass-123",
    )
    custom_category = Category.objects.create(
        name="Custom Category",
        color="#222222",
        is_default=False,
    )

    site = AdminSite()
    admin_obj = CategoryAdmin(Category, site)
    request = RequestFactory().get("/admin/api/category/")
    request.user = admin_user

    assert (
        admin_obj.has_delete_permission(request, obj=custom_category) is True
    )


@pytest.mark.django_db
def test_category_admin_allows_delete_when_obj_is_none():
    user_model = get_user_model()
    admin_user = user_model.objects.create_superuser(
        username="admin-user-3",
        email="admin3@example.com",
        password="strong-pass-123",
    )

    site = AdminSite()
    admin_obj = CategoryAdmin(Category, site)
    request = RequestFactory().get("/admin/api/category/")
    request.user = admin_user

    assert admin_obj.has_delete_permission(request, obj=None) is True
