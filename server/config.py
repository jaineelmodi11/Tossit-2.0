from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # Comma-separated list of allowed CORS origins, e.g. "https://myapp.com,exp://"
    allowed_origins: List[str] = ["*", "http://localhost:3000", "http://127.0.0.1:3000"]
    # Path to ONNX model (preferred) or .h5 TensorFlow model
    onnx_model_path: str = "./model.onnx"
    tf_model_path: str = "./model.h5"

    class Config:
        env_file = ".env"


settings = Settings()
