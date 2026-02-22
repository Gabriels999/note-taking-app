from django.test import RequestFactory

from api.validators.note_payload import parse_request_data


def test_parse_request_data_handles_urlencoded_payload():
    factory = RequestFactory()
    request = factory.patch(
        "/api/notes/1/",
        data="title=Updated+Title&content=Updated+Content&category_id=3",
        content_type="application/x-www-form-urlencoded",
    )

    parsed = parse_request_data(request)

    assert parsed.get("title") == "Updated Title"
    assert parsed.get("content") == "Updated Content"
    assert parsed.get("category_id") == "3"
