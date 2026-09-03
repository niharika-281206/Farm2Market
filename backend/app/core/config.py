from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True)

    PROJECT_NAME: str = "Smart Procurement Centre API"
    APP_ENV: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./sih.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Oracle Configuration (Optional Fallback)
    ORACLE_USERNAME: str = ""
    ORACLE_PASSWORD: str = ""
    ORACLE_HOST: str = ""
    ORACLE_PORT: str = "1521"
    ORACLE_SERVICE_NAME: str = ""
    
    # Security
    JWT_SECRET: str = "supersecretkey_change_in_production"
    JWT_REFRESH_SECRET: str = "supersecretrefreshkey_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # SMS
    SMS_PROVIDER: str = "mock"
    SMSLOCAL_API_KEY: str = ""
    SMSLOCAL_SENDER_ID: str = ""
    SMSLOCAL_TEMPLATE_ID: str = ""
    SMSLOCAL_ROUTE: int = 2
    OTP_MESSAGE_TEMPLATE: str = "Smart Procurement Centre: Your OTP is {OTP}. It is valid for 5 minutes. Do not share this OTP with anyone."
    
    # SMTP Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "SIH Smart Procurement Platform"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def get_database_url(self) -> str:
        if self.ORACLE_HOST and self.ORACLE_USERNAME and self.ORACLE_SERVICE_NAME:
            return f"oracle+oracledb://{self.ORACLE_USERNAME}:{self.ORACLE_PASSWORD}@{self.ORACLE_HOST}:{self.ORACLE_PORT}/?service_name={self.ORACLE_SERVICE_NAME}"
        return self.DATABASE_URL

settings = Settings()
