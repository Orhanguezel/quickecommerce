from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PRODUCTS_DIR = REPO_ROOT / "data" / "source-products"
IMPORTS_DIR = REPO_ROOT / "data" / "imports"
SOURCE_IMAGES_DIR = REPO_ROOT / "assets" / "source-images"


def load_repo_env() -> None:
    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        return

    import os

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def source_product_path(filename: str) -> str:
    SOURCE_PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    return str(SOURCE_PRODUCTS_DIR / filename)


def import_path(filename: str) -> str:
    IMPORTS_DIR.mkdir(parents=True, exist_ok=True)
    return str(IMPORTS_DIR / filename)


def source_image_dir(dirname: str) -> str:
    path = SOURCE_IMAGES_DIR / dirname
    path.mkdir(parents=True, exist_ok=True)
    return str(path)
