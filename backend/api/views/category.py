from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from api.cache.category_cache import (
    CATEGORY_CACHE_TTL_SECONDS,
    get_categories_payload_cache_key,
)
from api.serializers.category_serializer import serialize_category
from api.services.category_service import list_categories_for_user


@require_GET
def categories_collection(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    cache_key = get_categories_payload_cache_key(user_id=request.user.id)
    cached_payload = cache.get(cache_key)
    if cached_payload is not None:
        return JsonResponse(cached_payload)

    categories = list_categories_for_user(request.user)
    payload = {
        "categories": [serialize_category(category) for category in categories]
    }
    cache.set(cache_key, payload, CATEGORY_CACHE_TTL_SECONDS)
    return JsonResponse(payload)
