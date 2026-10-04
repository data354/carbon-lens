""" Utility functions for handling date-related operations."""
from bisect import bisect_left
from typing import List
import pandas as pd

from core.config import DATA_INDEX_PATH

DATA_INDEX = pd.read_csv(DATA_INDEX_PATH)

def date_to_months(date_str: str) -> int:
    """ Convert a date string (YYYY-MM format) to months since epoch. """
    return int(date_str[:4]) * 12 + int(date_str[5:])


def get_balanced_five_dates(available_dates: List[str], chosen_date: str) -> List[str]:
    """ Get 5 balanced dates around a chosen date. """
    if not available_dates:
        return []

    # Convert dates to months for binary search
    months_list = [date_to_months(d) for d in available_dates]
    target_months = date_to_months(chosen_date)

    # Find exact index using binary search
    pos = bisect_left(months_list, target_months)
    if pos == len(available_dates) or available_dates[pos] != chosen_date:
        return []  # chosen_date not found

    idx = pos

    # Take up to 2 dates before the chosen date
    left = []
    i = idx - 1
    while i >= 0 and len(left) < 2:
        left.append(available_dates[i])
        i -= 1

    # Take up to 2 dates after the chosen date
    right = []
    j = idx + 1
    while j < len(available_dates) and len(right) < 2:
        right.append(available_dates[j])
        j += 1

    # Calculate how many more dates we need to reach 5
    total = len(left) + 1 + len(right)
    needed = 5 - total

    # Fill remaining slots by taking dates further away, prioritizing proximity
    while needed > 0 and (i >= 0 or j < len(available_dates)):
        dist_left = target_months - months_list[i] if i >= 0 else float('inf')
        dist_right = months_list[j] - target_months if j < len(available_dates) else float('inf')

        if dist_left <= dist_right:
            left.append(available_dates[i])
            i -= 1
        else:
            right.append(available_dates[j])
            j += 1
        needed -= 1

    # Return in chronological order
    result = list(reversed(left)) + [chosen_date] + right
    return result

def get_two_closest_dates(chosen_date: str) -> List[str]:
    """ Get the two closest dates to the chosen date (one before if available and itself). """
    if not DATA_INDEX["date"].unique().tolist():
        return []

    available_dates = sorted(DATA_INDEX["date"].unique().tolist())
    months_list = [date_to_months(d) for d in available_dates]
    target_months = date_to_months(chosen_date)

    pos = bisect_left(months_list, target_months)
    if pos == len(available_dates) or available_dates[pos] != chosen_date:
        return []  # chosen_date not found

    idx = pos
    closest_dates = []

    # Get the closest date before the chosen date
    if idx > 0:
        closest_dates.extend([available_dates[idx - 1], available_dates[idx]])

    if idx == 0:
        closest_dates.append(available_dates[idx])

    return closest_dates
