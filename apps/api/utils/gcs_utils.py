"""Utility functions for Google Cloud Storage interactions."""
from google.cloud import storage
from google.api_core.exceptions import NotFound

from core.config import GCS_PREFIX


def build_file_path(zone: str, date: str) -> str:
    """Build the file path for a given zone and date."""
    return f"{GCS_PREFIX}/{zone}/senegal_{zone}_preds_{date}.csv"


def get_blob(bucket_name: str, file_path: str) -> storage.Blob:
    """Get a blob from a bucket."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_path)

    if not blob.exists():
        raise NotFound(f"{file_path} not found")

    return blob


def stream_blob(bucket_name: str, file_path: str) -> storage.Blob:
    """Stream a blob from a bucket."""
    blob = get_blob(bucket_name, file_path)
    return blob.open("rb")
