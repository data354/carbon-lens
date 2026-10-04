"use client";

import {
  createContext,
  use,
  useMemo,
  useState,
} from "react";
import {
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_ANIMATION_DURATION,
  ZOOM_STEP_PERCENTAGE,
} from "../constants/zoom";
import { getZoomLvlFromPercentage } from "../lib/zoom";
import { CENTER } from "../constants/place";
import { isDiff } from "@/lib/utils";
import { useMap } from "./map";

const ZOOM_TOLERANCE = 0.01;
const CENTER_TOLERANCE = 0.001;

interface IZoomContext {
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  canRecenter: boolean;
  setZoom: (zoom: number) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToPercentage: (
    percentage: number,
  ) => number | undefined;
  recenter: () => void;
}

const ZoomContext = createContext<IZoomContext | null>(
  null,
);

export function ZoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { map } = useMap();
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [center, setCenter] = useState({
    lat: CENTER.lat,
    lng: CENTER.lng,
  });

  const canZoomIn = useMemo(() => {
    if (!map) return false;
    return zoom < MAX_ZOOM;
  }, [map, zoom]);

  const canZoomOut = useMemo(() => {
    if (!map) return false;
    return zoom > MIN_ZOOM;
  }, [map, zoom]);

  const canRecenter = useMemo(() => {
    if (!map) return false;

    const zoomChanged = isDiff(
      zoom,
      INITIAL_ZOOM,
      ZOOM_TOLERANCE,
    );

    const centerChanged =
      isDiff(center.lat, CENTER.lat, CENTER_TOLERANCE) ||
      isDiff(center.lng, CENTER.lng, CENTER_TOLERANCE);

    return zoomChanged || centerChanged;
  }, [map, zoom, center.lat, center.lng]);

  const zoomIn = () => {
    if (!map) return;

    const newZoom = Math.min(
      Math.round(
        (zoom +
          getZoomLvlFromPercentage(ZOOM_STEP_PERCENTAGE)) *
          1e10,
      ) / 1e10, // avoid floating point precision issues
      MAX_ZOOM,
    );

    map.zoomTo(newZoom, {
      duration: ZOOM_ANIMATION_DURATION,
    });

    setZoom(newZoom);
  };

  const zoomOut = () => {
    if (!map) return;

    const newZoom = Math.max(
      Math.round(
        (zoom -
          getZoomLvlFromPercentage(ZOOM_STEP_PERCENTAGE)) *
          1e10,
      ) / 1e10,
      MIN_ZOOM,
    );

    map.zoomTo(newZoom, {
      duration: ZOOM_ANIMATION_DURATION,
    });

    setZoom(newZoom);
  };

  const zoomToPercentage = (percentage: number) => {
    if (!map) return;

    const newZoom = Math.min(
      Math.max(
        getZoomLvlFromPercentage(percentage),
        MIN_ZOOM,
      ),
      MAX_ZOOM,
    ); // clamp to min/max zoom

    map.zoomTo(newZoom, {
      animate: false,
    });

    setZoom(newZoom);

    return newZoom;
  };

  const recenter = () => {
    if (!map) return;

    map.easeTo({
      pitch: 0,
      bearing: 0,
      zoom: INITIAL_ZOOM,
      center: {
        lat: CENTER.lat,
        lng: CENTER.lng,
      },
    });

    setZoom(INITIAL_ZOOM);
    setCenter({ lat: CENTER.lat, lng: CENTER.lng });
  };

  return (
    <ZoomContext
      value={{
        zoom,
        canZoomIn,
        canZoomOut,
        canRecenter,
        setZoom,
        setCenter,
        zoomIn,
        zoomOut,
        zoomToPercentage,
        recenter,
      }}
    >
      {children}
    </ZoomContext>
  );
}

export function useZoom() {
  const ctx = use(ZoomContext);

  if (!ctx) {
    throw new Error(
      "useZoom must be used within a ZoomProvider",
    );
  }

  return ctx;
}
