from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120)
    color = models.CharField(max_length=32)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"
        constraints = [
            models.UniqueConstraint(
                fields=["name"],
                name="unique_category_name",
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
