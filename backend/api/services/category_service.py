from django.contrib.auth.models import User
from django.db.models import Q

from api.models import Category


def list_categories_for_user(user: User) -> list[Category]:
    return list(
        Category.objects.filter(
            Q(owner__isnull=True) | Q(owner=user)
        ).order_by("-is_default", "name")
    )
