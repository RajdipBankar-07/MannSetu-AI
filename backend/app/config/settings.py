import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/mannsetu_ai"
    DATABASE_NAME: str = "mannsetu_ai"
    GOOGLE_API_KEY: str = ""
    HUGGINGFACE_TOKEN: str = ""
    JWT_SECRET: str = "supersecretjwtsecretkeyshouldbechangedinproduction"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # Default 7 days, configurable

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
