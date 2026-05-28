"use client";

import {
  Map,
  Source,
  Layer,
  MapLayerMouseEvent,
} from "@vis.gl/react-maplibre";
import {
  use,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../constants/zoom";
import {
  GEOJSON_SOURCE_ID,
  RASTER_SOURCE_ID,
} from "../constants/layers";
import { CENTER } from "../constants/place";
import { useDebouncedCallback } from "use-debounce";
import { useAreaFetchingState } from "../contexts/area-fetching-state";
import { useHeaderHeight } from "@/features/dashboard/contexts/header-height";
import { useMapSearchParams } from "@/features/search/contexts/search-params";
import { DashboardDialogs } from "@/features/dashboard/components/dashboard-dialogs";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { DashboardSheets } from "@/features/dashboard/components/dashboard-sheets";
import { CustomAreasProvider } from "@/features/upload-area/contexts/custom-areas";
import { CustomArea } from "@/features/upload-area/types/custom-area";
import { DIALOG_ANIMATION_DURATION } from "@/components/ui/dialog";
import { useActiveFeature } from "../contexts/active-feature";
import { WatercoursesResponse } from "../types/watercourses";
import { useZoom } from "../contexts/zoom";
import { TitleJson } from "../types/title-json";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "../contexts/map";
import { env } from "@/configs/env";

const MIN_LAYER_ZOOM = 5;
const RASTER_OPACITY = 0.75;

interface CarbonMapProps {
  tileJsonPromise: Promise<TitleJson>;
  watercoursesPromise: Promise<WatercoursesResponse>;
  featureCollectionPromise: Promise<GeoJSON.FeatureCollection>;
  customAreasPromise: Promise<CustomArea[]>;
}

export function CarbonMap({
  tileJsonPromise,
  watercoursesPromise,
  featureCollectionPromise,
  customAreasPromise,
  children,
}: React.PropsWithChildren<CarbonMapProps>) {
  const { setZoom, setCenter } = useZoom();
  const { state, setState } = useAreaFetchingState();
  const { reset: resetSearchParams } = useMapSearchParams();
  const { map, registerMap } = useMap();
  const { height } = useHeaderHeight();
  const { activeFeature, setActiveFeature } =
    useActiveFeature();
  const [hoveredFeature, setHoveredFeature] =
    useState<GeoJSON.Feature>();
  const { open: openDialog, close: closeDialog } =
    useDashboardDialogs();

  const tileJson = use(tileJsonPromise);
  const customAreas = use(customAreasPromise);
  const featureCollection = use(featureCollectionPromise);
  const watercourses = use(watercoursesPromise);

  const hasPendingState = Object.values(state).some(
    (state) => state === "pending",
  );

  const handleMapLoad = useCallback(
    (e: maplibregl.MapLibreEvent) => {
      registerMap(e.target);
    },
    [registerMap],
  );

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!map || hasPendingState) {
        return;
      }

      const features = e.features || [];
      const feature = features.at(0);

      if (!features.length) {
        return;
      }

      if (feature?.id == null) {
        return;
      }

      map.setFeatureState(
        { source: GEOJSON_SOURCE_ID, id: feature.id },
        { selected: true },
      );

      setActiveFeature(feature);
      openDialog("stats");
    },
    [map, openDialog, setActiveFeature, hasPendingState],
  );

  const handleMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!map || hasPendingState) {
        return;
      }

      const features = e.features || [];
      const feature = features.at(0);

      if (!features.length || feature?.id == null) {
        if (hoveredFeature?.id != null) {
          map.setFeatureState(
            {
              source: GEOJSON_SOURCE_ID,
              id: hoveredFeature.id,
            },
            { hovered: false },
          );
        }

        setHoveredFeature(undefined);
        map.getCanvas().style.cursor = "";
        return;
      }

      if (hoveredFeature?.id === feature.id) {
        return;
      }

      if (hoveredFeature?.id != null) {
        map.setFeatureState(
          {
            source: GEOJSON_SOURCE_ID,
            id: hoveredFeature.id,
          },
          { hovered: false },
        );
      }

      map.setFeatureState(
        { source: GEOJSON_SOURCE_ID, id: feature.id },
        { hovered: true },
      );

      setHoveredFeature(feature);
      map.getCanvas().style.cursor = "pointer";
    },
    [map, hoveredFeature, hasPendingState],
  );

  const debouncedClearFeatureStates = useDebouncedCallback(
    () => {
      setActiveFeature(undefined);
      setHoveredFeature(undefined);
      resetSearchParams();
    },
    DIALOG_ANIMATION_DURATION,
  );

  const handleStatsDialogClose = useCallback(() => {
    if (!map) return;

    if (activeFeature) {
      map.setFeatureState(
        { source: GEOJSON_SOURCE_ID, id: activeFeature.id },
        { selected: false },
      );
    }

    if (hoveredFeature?.id != null) {
      map.setFeatureState(
        {
          source: GEOJSON_SOURCE_ID,
          id: hoveredFeature.id,
        },
        { hovered: false },
      );
    }

    debouncedClearFeatureStates();
    closeDialog();
  }, [
    map,
    activeFeature,
    hoveredFeature,
    debouncedClearFeatureStates,
    closeDialog,
  ]);

  useEffect(() => {
    return () => {
      if (map && hoveredFeature?.id != null) {
        map.setFeatureState(
          {
            source: GEOJSON_SOURCE_ID,
            id: hoveredFeature.id,
          },
          { hovered: false },
        );

        setHoveredFeature(undefined);
      }
    };
  }, [map, hoveredFeature]);

  return (
    <CustomAreasProvider data={customAreas}>
      <div
        className="bg-muted relative flex w-full items-center justify-center"
        style={{ height: `calc(100dvh - ${height}px)` }}
      >
        <Map
          initialViewState={{
            latitude: CENTER.lat,
            longitude: CENTER.lng,
            zoom: INITIAL_ZOOM,
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=In47kXHOzAvwIMB05Ye0"
          interactiveLayerIds={[
            `${GEOJSON_SOURCE_ID}-fill`,
          ]}
          attributionControl={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onLoad={handleMapLoad}
          onRender={() => {
            if (state.area === "pending") {
              setState((prev) => ({
                ...prev,
                area: "success",
              }));
            }

            if (state.date === "pending") {
              setState((prev) => ({
                ...prev,
                date: "success",
              }));
            }
          }}
          onDrag={(e) => {
            setCenter({
              lat: e.viewState.latitude,
              lng: e.viewState.longitude,
            });
          }}
          onZoom={(e) => {
            setZoom(e.viewState.zoom);
          }}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
        >
          <Source
            type="raster"
            id={RASTER_SOURCE_ID}
            tiles={tileJson.tiles.map((tile_url) => {
              return `${env.NEXT_PUBLIC_GEO_API_BASE_URL}${tile_url}`;
            })}
            minzoom={tileJson.minzoom}
            maxzoom={tileJson.maxzoom}
            attribution={tileJson.attribution}
          >
            <Layer
              type="raster"
              id={`${RASTER_SOURCE_ID}-fill`}
              source={RASTER_SOURCE_ID}
              minzoom={MIN_LAYER_ZOOM}
              paint={{
                "raster-opacity": RASTER_OPACITY,
                "raster-resampling": "nearest",
              }}
            />
          </Source>

          <Source
            type="raster"
            id="watercourses"
            tiles={watercourses.source.tiles.map(
              (tile_url) => {
                return `${env.NEXT_PUBLIC_GEO_API_BASE_URL}${tile_url}`;
              },
            )}
            minzoom={watercourses.source.minzoom}
            maxzoom={watercourses.source.maxzoom}
            attribution={watercourses.source.attribution}
          >
            <Layer
              type="raster"
              id="watercourses-fill"
              source="watercourses"
              minzoom={MIN_LAYER_ZOOM}
              paint={{
                "raster-resampling": "linear",
              }}
            />
          </Source>

          <Source
            type="geojson"
            id={GEOJSON_SOURCE_ID}
            data={featureCollection}
            generateId={true}
          >
            <Layer
              type="fill"
              id={`${GEOJSON_SOURCE_ID}-fill`}
              source={GEOJSON_SOURCE_ID}
              minzoom={MIN_LAYER_ZOOM}
              paint={{
                "fill-color": [
                  "case",
                  [
                    "boolean",
                    ["feature-state", "hovered"],
                    false,
                  ],
                  "#3B82F6",
                  "transparent",
                ],
                "fill-opacity": [
                  "case",
                  [
                    "boolean",
                    ["feature-state", "hovered"],
                    false,
                  ],
                  0.1,
                  0,
                ],
              }}
            />
            <Layer
              type="line"
              id={`${GEOJSON_SOURCE_ID}-outline`}
              source={GEOJSON_SOURCE_ID}
              minzoom={MIN_LAYER_ZOOM}
              paint={{
                "line-color": "black",
                "line-width": [
                  "case",
                  [
                    "boolean",
                    ["feature-state", "selected"],
                    false,
                  ],
                  4,
                  1.5,
                ],
                "line-opacity": 1,
              }}
            />
          </Source>
        </Map>

        {children}
      </div>

      <DashboardSheets />
      <DashboardDialogs
        onStatsClose={handleStatsDialogClose}
      />
    </CustomAreasProvider>
  );
}
