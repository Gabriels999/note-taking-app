from django.contrib import admin

from api.models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "is_default", "color")
    list_filter = ("is_default",)
    search_fields = ("name",)
    readonly_fields = ("name", "owner", "is_default", "color")

    def has_delete_permission(self, request, obj=None):
        return not obj.is_default


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "category", "edited_at")
    list_filter = ("category", "user")
    search_fields = ("title", "content")
