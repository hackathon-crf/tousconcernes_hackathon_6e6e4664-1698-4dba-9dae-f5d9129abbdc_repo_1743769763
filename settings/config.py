from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ! Change allowed host when cors pb solved
    ALLOWED_HOSTS: List[str] = [
        "http://localhost",
        "*",
        "https://hackathon-croix-rouge.vercel.app",
    ]
    PROJECT_NAME: str = "Default ForgeAI Application"
    API_VERSION_STR: str = "/api/v1"
    PROJECT_VERSION: str = "0.0.1"
    BASE_URL: str = "http://localhost"
    BACKEND_PORT: int = 8090
    ROOT_PATH: str = ""

    class Config:
        env_file = '.client_env'
        env_file_encoding = 'utf-8'
        env_ignore_empty = True
        extra = "ignore"


settings = Settings()
