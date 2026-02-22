from django.http import JsonResponse
from django.views.decorators.http import require_GET

from api.serializers.category_serializer import serialize_category
from api.services.category_service import list_categories_for_user


@require_GET
def categories_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    categories = list_categories_for_user(request.user)
    return JsonResponse(
        {
            "categories": [
                serialize_category(category) for category in categories
            ]
        }
    )
