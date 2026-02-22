from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from api.cache.category_cache import bump_category_cache_version
from api.models import Category


@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def invalidate_categories_cache_on_category_change(**kwargs):
    bump_category_cache_version()
