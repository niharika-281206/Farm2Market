from abc import ABC, abstractmethod
from app.core.config import settings
import httpx
from fastapi import HTTPException

class SMSProvider(ABC):
    @abstractmethod
    def send_otp(self, mobile: str, otp: str) -> bool:
        pass

class MockSMSProvider(SMSProvider):
    def send_otp(self, mobile: str, otp: str) -> bool:
        print("\n" + "="*50)
        print(f"[MOCK SMS DISPATCHED]")
        print(f"To: {mobile}")
        print(f"Message: {settings.OTP_MESSAGE_TEMPLATE.replace('{OTP}', otp)}")
        print("="*50 + "\n")
        return True

class SMSLocalProvider(SMSProvider):
    def send_otp(self, mobile: str, otp: str) -> bool:
        if not settings.SMSLOCAL_API_KEY or not settings.SMSLOCAL_SENDER_ID or not settings.SMSLOCAL_TEMPLATE_ID:
            raise HTTPException(status_code=503, detail="SMS service is not configured (Missing SMSLocal Credentials). Please contact admin.")

        message = settings.OTP_MESSAGE_TEMPLATE.replace("{OTP}", otp)
        params = {
            "key": settings.SMSLOCAL_API_KEY,
            "route": settings.SMSLOCAL_ROUTE,
            "sender": settings.SMSLOCAL_SENDER_ID,
            "number": mobile,
            "sms": message,
            "templateid": settings.SMSLOCAL_TEMPLATE_ID,
        }
        try:
            response = httpx.get("https://app.smslocal.in/api/smsapi", params=params, timeout=10)
            response.raise_for_status()
        except httpx.HTTPError:
            return False

        body = response.text.lower()
        return not any(marker in body for marker in ("error", "invalid", "failed", "insufficient"))

def get_sms_provider() -> SMSProvider:
    provider = settings.SMS_PROVIDER.lower()
    if provider == "smslocal":
        return SMSLocalProvider()
    elif provider == "mock":
        return MockSMSProvider()
    else:
        raise HTTPException(status_code=503, detail="SMS service is not configured correctly. Set SMS_PROVIDER to smslocal or mock.")

def sms_provider_is_configured() -> bool:
    provider = settings.SMS_PROVIDER.lower()
    if provider == "mock":
        return True
    if provider == "smslocal":
        return bool(
            settings.SMSLOCAL_API_KEY
            and settings.SMSLOCAL_SENDER_ID
            and settings.SMSLOCAL_TEMPLATE_ID
        )
    return False

import secrets

def generate_otp() -> str:
    # DEMO MODE: Hardcoded for easy testing
    return "123456"
