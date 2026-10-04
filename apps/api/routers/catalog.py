""" Catalog router for listing available dates and retrieving COG URLs. """
from fastapi import APIRouter, HTTPException

import models as models
from utils.date_utils import DATA_INDEX

router = APIRouter()

@router.get("/dates", response_model=models.DatesResponse)
def list_dates():
    """ List available dates in the catalog. """
    return {"dates": sorted(DATA_INDEX["date"].unique().tolist())}

@router.get(
    "/cog", 
    response_model=models.CatalogItemResponse,
    responses={
        200: {"description": "COG URL retrieved successfully"},
        404: {"description": "Unknown date"},
    }
)
def get_cog(date: str):
    """ Get COG URL for a given date. """
    row = DATA_INDEX.loc[DATA_INDEX["date"] == date]
    if row.empty:
        raise HTTPException(status_code=404, detail="Unknown date")
    return row.iloc[0].to_dict()
