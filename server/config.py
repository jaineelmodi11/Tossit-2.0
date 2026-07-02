from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # Comma-separated list of allowed CORS origins. Locked to the local dev
    # client by default; set ALLOWED_ORIGINS for production deployments.
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Path to ONNX model (preferred) or .h5 TensorFlow model
    onnx_model_path: str = "./model.onnx"
    tf_model_path: str = "./model.h5"


settings = Settings()
