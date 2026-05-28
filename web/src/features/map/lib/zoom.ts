import { INITIAL_ZOOM } from "../constants/zoom";

export function getZoomLvlFromPercentage(
  percentage: number,
) {
  return (percentage * INITIAL_ZOOM) / 100;
}

export function getPercentageFromZoomLvl(zoom: number) {
  return (zoom * 100) / INITIAL_ZOOM;
}
