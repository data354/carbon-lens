""" This module defines the legend endpoint for the CarbonLens API. """

from fastapi import APIRouter

import models as models
from core.config import CARBON_CLASSES

router = APIRouter()

@router.get("/carbon-classes", response_model=list[models.CarbonClass])
def get_carbon_classes():
    """ Get carbon classes. """
    return CARBON_CLASSES
