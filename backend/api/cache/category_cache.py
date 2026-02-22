from django.core.cache import cache

CATEGORY_CACHE_TTL_SECONDS = 60 * 60 * 24
CATEGORY_CACHE_VERSION_KEY = "categories_cache_version"


def get_category_cache_version() -> int:
    version = cache.get(CATEGORY_CACHE_VERSION_KEY)
    if version is None:
        cache.add(CATEGORY_CACHE_VERSION_KEY, 1, CATEGORY_CACHE_TTL_SECONDS)
        return 1
    return int(version)


def get_categories_payload_cache_key(*, user_id: int) -> str:
    version = get_category_cache_version()
    return f"categories:user:{user_id}:v:{version}"


def bump_category_cache_version() -> None:
    try:
        cache.incr(CATEGORY_CACHE_VERSION_KEY)
        return
    except ValueError:
        cache.set(CATEGORY_CACHE_VERSION_KEY, 2, CATEGORY_CACHE_TTL_SECONDS)
        return
    except NotImplementedError:
        pass

    current = get_category_cache_version()
    cache.set(
        CATEGORY_CACHE_VERSION_KEY,
        current + 1,
        CATEGORY_CACHE_TTL_SECONDS,
    )
