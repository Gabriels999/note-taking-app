from django.conf import settings
from django.db import models


class Category(models.Model):
    DEFAULTS = (
        {"name": "Random Thoughts", "color": "#EF9C66", "is_default": True},
        {"name": "School", "color": "#FCDC94", "is_default": True},
        {"name": "Personal", "color": "#78ABA8", "is_default": True},
    )

    name = models.CharField(max_length=120)
    color = models.CharField(max_length=7)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
        null=True,
        blank=True,
    )
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"
        constraints = [
            models.UniqueConstraint(
                fields=["name"],
                condition=models.Q(owner__isnull=True),
                name="unique_shared_category_name",
            ),
            models.UniqueConstraint(
                fields=["owner", "name"],
                condition=models.Q(owner__isnull=False),
                name="unique_user_category_name",
            ),
        ]

    def __str__(self):
        return self.name


class Note(models.Model):
    title = models.CharField(max_length=180)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="notes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )

    class Meta:
        ordering = ["-edited_at", "-created_at"]

    def __str__(self):
        return self.title
