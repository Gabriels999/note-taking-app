from api.models import Note


def serialize_note(note: Note) -> dict:
    """Convert a Note instance into a dictionary suitable for JSON
    serialization.

    Args:
        note (Note): The Note instance to serialize.
    Returns:
        dict: A dictionary representation of the Note instance.
    """
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "edited_at": note.edited_at.isoformat(),
        "category": {
            "id": note.category.id,
            "name": note.category.name,
            "color": note.category.color,
        },
        "user_id": note.user_id,
    }
