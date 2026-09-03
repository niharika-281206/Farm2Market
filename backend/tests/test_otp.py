import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.routers.auth import normalize_mobile
from app.services import sms_service


def test_normalize_indian_mobile_number():
    assert normalize_mobile("+91 98765 43210") == "9876543210"


def test_reject_invalid_mobile_number():
    with pytest.raises(Exception):
        normalize_mobile("5123456789")


def test_smslocal_uses_entered_mobile(monkeypatch):
    captured = {}

    class Response:
        text = "success"

        def raise_for_status(self):
            return None

    def fake_get(url, params, timeout):
        captured.update(params)
        return Response()

    monkeypatch.setattr(sms_service.httpx, "get", fake_get)
    monkeypatch.setattr(sms_service.settings, "SMSLOCAL_API_KEY", "test-key")
    monkeypatch.setattr(sms_service.settings, "SMSLOCAL_SENDER_ID", "TEST")
    monkeypatch.setattr(sms_service.settings, "SMSLOCAL_TEMPLATE_ID", "template")

    assert sms_service.SMSLocalProvider().send_otp("9876543210", "482913")
    assert captured["number"] == "9876543210"