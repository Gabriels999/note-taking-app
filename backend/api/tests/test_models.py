import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from api.models import Category, Note


def default_name(index):
    return Category.DEFAULTS[index]["name"]


@pytest.mark.django_db
def test_note_must_have_category_and_user():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="model-user",
        password="strong-pass-123",
    )
    category = Category.objects.get(name=default_name(0))

    note = Note.objects.create(
        title="First note",
        content="Some content",
        category=category,
        user=user,
    )

    assert note.category_id == category.id
    assert note.user_id == user.id


@pytest.mark.django_db
def test_note_without_category_fails():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="no-category-user",
        password="strong-pass-123",
    )

    with pytest.raises(IntegrityError):
        Note.objects.create(
            title="Invalid note",
            content="No category",
            user=user,
        )


@pytest.mark.django_db
def test_note_without_user_fails():
    category = Category.objects.get(name=default_name(1))

    with pytest.raises(IntegrityError):
        Note.objects.create(
            title="Invalid note",
            content="No user",
            category=category,
        )


@pytest.mark.django_db
def test_category_can_have_many_notes_and_users():
    user_model = get_user_model()
    category = Category.objects.get(name=default_name(2))
    user_a = user_model.objects.create_user(
        username="user-a",
        password="strong-pass-123",
    )
    user_b = user_model.objects.create_user(
        username="user-b",
        password="strong-pass-123",
    )

    Note.objects.create(
        title="A1",
        content="first",
        category=category,
        user=user_a,
    )
    Note.objects.create(
        title="B1",
        content="second",
        category=category,
        user=user_b,
    )

    assert category.notes.count() == 2
    assert set(category.notes.values_list("user__username", flat=True)) == {
        "user-a",
        "user-b",
    }


@pytest.mark.django_db
def test_category_str_returns_name():
    category = Category.objects.get(name=default_name(0))

    assert str(category) == default_name(0)


@pytest.mark.django_db
def test_note_str_returns_title():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="string-user",
        password="strong-pass-123",
    )
    category = Category.objects.get(name=default_name(1))
    note = Note.objects.create(
        title="Read chapter 1",
        content="Linear algebra notes",
        category=category,
        user=user,
    )

    assert str(note) == "Read chapter 1"


@pytest.mark.django_db
def test_category_defaults_are_seeded():
    categories = set(
        Category.objects.values_list("name", "color", "is_default")
    )

    assert categories == {
        (item["name"], item["color"], item.get("is_default", True))
        for item in Category.DEFAULTS
    }

    assert Category.objects.filter(owner__isnull=True).count() == 3


@pytest.mark.django_db
def test_user_can_have_private_category_with_same_name_as_shared_default():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="private-category-user",
        password="strong-pass-123",
    )

    category = Category.objects.create(
        name=default_name(0),
        color="#111111",
        owner=user,
        is_default=False,
    )

    assert category.owner_id == user.id
    assert category.name == default_name(0)


@pytest.mark.django_db
def test_same_user_cannot_duplicate_private_category_name():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="dup-user",
        password="strong-pass-123",
    )
    Category.objects.create(
        name="Projects",
        color="#111111",
        owner=user,
        is_default=False,
    )

    with pytest.raises(IntegrityError):
        Category.objects.create(
            name="Projects",
            color="#222222",
            owner=user,
            is_default=False,
        )
