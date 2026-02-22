from django.db.models import Q
from django.shortcuts import get_object_or_404

from api.models import Category, Note
from django.contrib.auth.models import User


class CategoryNotFoundError(Exception):
    pass


def list_notes_for_user(user: User) -> list[Note]:
    """
    Returns a list of Note objects belonging to the given user,
    ordered by edited_at and created_at.

    Args:
        user (User): The user whose notes are to be listed.
    Returns:
        list[Note]: A list of Note objects belonging to the user.
    """
    return list(Note.objects.filter(user=user).select_related("category"))


def get_note_for_user(user: User, note_id: int) -> Note:
    """
    Returns a Note object with the given note_id that belongs to the
    given user.
    Args:
        user (User): The user who owns the note.
        note_id (int): The ID of the note to retrieve.
    Returns:
        Note: The Note object with the given note_id that belongs to the user.
    Raises:
        Http404: If no Note with the given note_id exists for the user.
    """
    return get_object_or_404(
        Note.objects.select_related("category"),
        id=note_id,
        user=user,
    )


def _allowed_category_for_user_or_none(
    category_id: int, user: User
) -> list[Category]:
    """
    Returns a list of Category objects with the given category_id that are
    either shared (owner is null) or owned by the given user.
    Args:
        category_id (int): The ID of the category to retrieve.
        user (User): The user for whom to check category ownership.
    Returns:
        list[Category]: A list of Category objects with the given category_id
        that are either shared or owned by the user.
        The list will contain at most one Category.
    """
    return list(
        Category.objects.filter(id=category_id).filter(
            Q(owner__isnull=True) | Q(owner=user)
        )
    )


def create_note_for_user(user: User, title, content, category_id):
    """
    Creates a new Note object with the given title, content, and category_id,
    and associates it with the given user.
    Args:
        user (User): The user who will own the new note.
        title (str): The title of the new note.
        content (str): The content of the new note.
        category_id (int): The ID of the category to associate
        with the new note.
    Returns:
        Note: The newly created Note object.
    Raises:
        CategoryNotFoundError: If no Category with the given category_id exists
        that is either shared or owned by the user.
    """
    categories = _allowed_category_for_user_or_none(category_id, user)
    category = categories[0] if categories else None
    if category is None:
        raise CategoryNotFoundError

    return Note.objects.create(
        title=title,
        content=content,
        category=category,
        user=user,
    )


def patch_note_for_user(
    note: Note, user: User, title=None, content=None, category_id=None
):
    """
    Patches the given Note object with the provided title, content,
    and category_id, if they are not None. The note must belong to
    the given user.
    Args:
        note (Note): The Note object to patch. Must belong to the user.
        user (User): The user who owns the note.
        title (str, optional): The new title for the note.
            If None, the title will not be changed.
        content (str, optional): The new content for the note.
            If None, the content will not be changed.
        category_id (int, optional): The ID of the new category to associate
            with the note. If None, the category will not be changed.
    Returns:
        Note: The updated Note object after patching.
    Raises:
        CategoryNotFoundError: If category_id is provided and no Category with
            the given category_id exists that is either shared or owned by
            the user.
    """
    if title is not None:
        note.title = title.strip()
    if content is not None:
        note.content = content.strip()
    if category_id is not None:
        categories = _allowed_category_for_user_or_none(category_id, user)
        category = categories[0] if categories else None
        if category is None:
            raise CategoryNotFoundError
        note.category = category

    note.save()
    return note
