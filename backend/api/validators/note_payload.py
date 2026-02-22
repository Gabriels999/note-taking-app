import json

from django.http import QueryDict


def parse_request_data(request):
    if request.method == "POST":
        return request.POST

    content_type = request.content_type or ""
    if content_type.startswith("application/json"):
        try:
            return json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}

    if content_type.startswith("application/x-www-form-urlencoded"):
        return QueryDict(request.body.decode("utf-8"))

    return {}


def validate_note_create_payload(data: dict) -> tuple[dict, dict]:
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category_id = data.get("category_id")

    errors = {}
    if category_id in (None, ""):
        errors["category_id"] = ["This field is required."]

    return (
        {"title": title, "content": content, "category_id": category_id},
        errors,
    )
