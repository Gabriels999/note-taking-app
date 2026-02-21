from django.core.management.base import BaseCommand

from api.models import Category


class Command(BaseCommand):
    help = "Synchronize shared default categories from Category.DEFAULTS."

    def handle(self, *args, **options):
        for item in Category.DEFAULTS:
            Category.objects.update_or_create(
                owner=None,
                name=item["name"],
                defaults={
                    "color": item["color"],
                    "is_default": item.get("is_default", True),
                },
            )

        self.stdout.write(
            self.style.SUCCESS("Default categories synchronized.")
        )
