import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from api.models import Category, Note


@pytest.mark.django_db
def test_note_must_have_category_and_user():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="model-user",
        password="strong-pass-123",
    )
    category = Category.objects.create(name="Work", color="#22C55E")

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
    category = Category.objects.create(name="Personal", color="#60A5FA")

    with pytest.raises(IntegrityError):
        Note.objects.create(
            title="Invalid note",
            content="No user",
            category=category,
        )


@pytest.mark.django_db
def test_category_can_have_many_notes_and_users():
    user_model = get_user_model()
    category = Category.objects.create(name="Ideas", color="#F59E0B")
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
    category = Category.objects.create(name="Books", color="#A855F7")

    assert str(category) == "Books"


@pytest.mark.django_db
def test_note_str_returns_title():
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="string-user",
        password="strong-pass-123",
    )
    category = Category.objects.create(name="Study", color="#14B8A6")
    note = Note.objects.create(
        title="Read chapter 1",
        content="Linear algebra notes",
        category=category,
        user=user,
    )

    assert str(note) == "Read chapter 1"
