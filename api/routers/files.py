""" Files routers for downloading files."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from google.api_core.exceptions import NotFound

from core.config import GCS_BUCKET
from models import FileQuery
from utils.gcs_utils import build_file_path, stream_blob

router = APIRouter()


@router.get(
    "/download", 
    summary="Download a CSV file",
    responses={
        200: {"description": "File downloaded successfully"},
        404: {"description": "File not found"},
        500: {"description": "Internal server error while downloading file"},
    },
)
def download_file(query: Annotated[FileQuery, Depends()]):
    """Download a CSV file from GCS based on zone and date."""
    file_path = build_file_path(query.zone, query.date)

    try:
        stream = stream_blob(GCS_BUCKET, file_path)

        filename = f"{query.zone}_{query.date}.csv"

        return StreamingResponse(
            stream,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )

    except NotFound as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc

    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error") from exc
