import pytest
from django.core.management import call_command

from api.models import Category


@pytest.mark.django_db
def test_sync_default_categories_command_updates_shared_defaults():
    Category.objects.filter(owner__isnull=True).delete()
    Category.objects.create(
        name=Category.DEFAULTS[0]["name"],
        color="#000000",
        owner=None,
        is_default=False,
    )

    call_command("sync_default_categories")

    categories = set(
        Category.objects.filter(owner__isnull=True).values_list(
            "name",
            "color",
            "is_default",
        )
    )
    expected = {
        (item["name"], item["color"], item.get("is_default", True))
        for item in Category.DEFAULTS
    }

    assert categories == expected
