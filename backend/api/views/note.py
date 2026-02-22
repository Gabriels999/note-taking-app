from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from api.serializers.note_serializer import serialize_note
from api.services.note_service import (
    CategoryNotFoundError,
    create_note_for_user,
    get_note_for_user,
    list_notes_for_user,
    patch_note_for_user,
)
from api.validators.note_payload import (
    parse_request_data,
    validate_note_create_payload,
)


@require_http_methods(["GET", "POST"])
def notes_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    if request.method == "GET":
        notes = list_notes_for_user(request.user)
        return JsonResponse(
            {"notes": [serialize_note(note) for note in notes]}
        )

    data = parse_request_data(request)
    payload, errors = validate_note_create_payload(data)
    if errors:
        return JsonResponse(
            {"detail": "Invalid payload", "errors": errors},
            status=400,
        )

    try:
        note = create_note_for_user(
            request.user,
            title=payload["title"],
            content=payload["content"],
            category_id=payload["category_id"],
        )
    except CategoryNotFoundError:
        return JsonResponse({"detail": "Category not found"}, status=400)

    return JsonResponse(serialize_note(note), status=201)


@require_http_methods(["GET", "PATCH"])
def note_detail(request, note_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    note = get_note_for_user(request.user, note_id)

    if request.method == "GET":
        return JsonResponse(serialize_note(note))

    data = parse_request_data(request)

    try:
        note = patch_note_for_user(
            note,
            request.user,
            title=data.get("title"),
            content=data.get("content"),
            category_id=data.get("category_id"),
        )
    except CategoryNotFoundError:
        return JsonResponse({"detail": "Category not found"}, status=400)

    return JsonResponse(serialize_note(note))
