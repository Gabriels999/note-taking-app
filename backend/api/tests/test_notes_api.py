import json

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from api.models import Category, Note


@pytest.mark.django_db
def test_notes_collection_requires_authentication(client):
    response = client.get(reverse("notes-collection"))

    assert response.status_code == 401


@pytest.mark.django_db
def test_notes_collection_lists_only_authenticated_user_notes(client):
    user_model = get_user_model()
    owner = user_model.objects.create_user("owner", password="strong-pass-123")
    other = user_model.objects.create_user("other", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    Note.objects.create(
        title="Owner note",
        content="owner content",
        category=category,
        user=owner,
    )
    Note.objects.create(
        title="Other note",
        content="other content",
        category=category,
        user=other,
    )
    client.force_login(owner)

    response = client.get(reverse("notes-collection"))

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["notes"]) == 1
    assert payload["notes"][0]["title"] == "Owner note"


@pytest.mark.django_db
def test_notes_collection_create_note(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("author", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    client.force_login(user)

    response = client.post(
        reverse("notes-collection"),
        {
            "title": "API note",
            "content": "Created from API",
            "category_id": category.id,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["title"] == "API note"
    assert payload["category"]["id"] == category.id
    assert Note.objects.filter(user=user, title="API note").exists()


@pytest.mark.django_db
def test_notes_collection_create_rejects_invalid_category(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("author", password="strong-pass-123")
    client.force_login(user)

    response = client.post(
        reverse("notes-collection"),
        {
            "title": "API note",
            "content": "Created from API",
            "category_id": 999999,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Category not found"


@pytest.mark.django_db
def test_notes_collection_create_requires_category(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("author", password="strong-pass-123")
    client.force_login(user)

    response = client.post(
        reverse("notes-collection"),
        {
            "title": "",
            "content": "",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid payload"
    assert response.json()["errors"]["category_id"] == [
        "This field is required."
    ]


@pytest.mark.django_db
def test_notes_collection_create_allows_empty_title_and_content(client):
    user_model = get_user_model()
    user = user_model.objects.create_user(
        "author-empty", password="strong-pass-123"
    )
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    client.force_login(user)

    response = client.post(
        reverse("notes-collection"),
        {
            "title": "",
            "content": "",
            "category_id": category.id,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["title"] == ""
    assert payload["content"] == ""
    assert payload["category"]["id"] == category.id


@pytest.mark.django_db
def test_note_detail_returns_owned_note(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("reader", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[1]["name"])
    note = Note.objects.create(
        title="Owned note",
        content="detail content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.get(reverse("note-detail", kwargs={"note_id": note.id}))

    assert response.status_code == 200
    assert response.json()["id"] == note.id


@pytest.mark.django_db
def test_note_detail_not_found_for_other_user_note(client):
    user_model = get_user_model()
    owner = user_model.objects.create_user("owner", password="strong-pass-123")
    other = user_model.objects.create_user("other", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[2]["name"])
    note = Note.objects.create(
        title="Private",
        content="cannot read this",
        category=category,
        user=owner,
    )
    client.force_login(other)

    response = client.get(reverse("note-detail", kwargs={"note_id": note.id}))

    assert response.status_code == 404


@pytest.mark.django_db
def test_note_detail_requires_authentication(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("owner2", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Private",
        content="cannot read this",
        category=category,
        user=user,
    )

    response = client.get(reverse("note-detail", kwargs={"note_id": note.id}))

    assert response.status_code == 401


@pytest.mark.django_db
def test_note_detail_patch_updates_fields(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("editor", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    updated_category = Category.objects.get(name=Category.DEFAULTS[1]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data=json.dumps(
            {
                "title": "New title",
                "content": "New content",
                "category_id": updated_category.id,
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == "New title"
    assert note.content == "New content"
    assert note.category_id == updated_category.id


@pytest.mark.django_db
def test_note_detail_patch_blank_title_is_allowed(client):
    user_model = get_user_model()
    user = user_model.objects.create_user(
        "editor_blank", password="strong-pass-123"
    )
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data=json.dumps({"title": "   "}),
        content_type="application/json",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == ""


@pytest.mark.django_db
def test_note_detail_patch_blank_content_is_allowed(client):
    user_model = get_user_model()
    user = user_model.objects.create_user(
        "editor_blank_content", password="strong-pass-123"
    )
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data=json.dumps({"content": "   "}),
        content_type="application/json",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.content == ""


@pytest.mark.django_db
def test_note_detail_patch_malformed_json_keeps_note_unchanged(client):
    user_model = get_user_model()
    user = user_model.objects.create_user(
        "editor_json", password="strong-pass-123"
    )
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data="{invalid_json",
        content_type="application/json",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == "Old title"
    assert note.content == "Old content"


@pytest.mark.django_db
def test_note_detail_patch_unsupported_content_type_keeps_note_unchanged(
    client,
):
    user_model = get_user_model()
    user = user_model.objects.create_user(
        "editor_text", password="strong-pass-123"
    )
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data="title=ignored",
        content_type="text/plain",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == "Old title"


@pytest.mark.django_db
def test_note_detail_patch_rejects_invalid_category(client):
    user_model = get_user_model()
    user = user_model.objects.create_user("editor", password="strong-pass-123")
    category = Category.objects.get(name=Category.DEFAULTS[0]["name"])
    note = Note.objects.create(
        title="Old title",
        content="Old content",
        category=category,
        user=user,
    )
    client.force_login(user)

    response = client.patch(
        reverse("note-detail", kwargs={"note_id": note.id}),
        data=json.dumps({"category_id": 999999}),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Category not found"
