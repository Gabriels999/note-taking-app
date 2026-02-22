from api.models import Category


def serialize_category(category: Category) -> dict:
    return {
        "id": category.id,
        "name": category.name,
        "color": category.color,
        "is_default": category.is_default,
        "owner_id": category.owner_id,
    }
