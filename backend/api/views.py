from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView
from django.http import HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


def health_check(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "backend",
        }
    )


@ensure_csrf_cookie
def csrf_cookie(request):
    return JsonResponse({"detail": "CSRF cookie set"})


class APILoginView(LoginView):
    def form_valid(self, form):
        super().form_valid(form)
        return JsonResponse({"detail": "Login successful"})

    def form_invalid(self, form):
        return JsonResponse(
            {
                "detail": "Invalid credentials",
                "errors": form.errors.get_json_data(),
            },
            status=400,
        )

    def get(self, request, *args, **kwargs):
        return HttpResponseNotAllowed(["POST"])


def signup(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    form = UserCreationForm(request.POST)

    if form.is_valid():
        user = form.save()
        login(request, user)
        return JsonResponse({"detail": "Signup successful"}, status=201)

    return JsonResponse(
        {
            "detail": "Signup failed",
            "errors": form.errors.get_json_data(),
        },
        status=400,
    )
