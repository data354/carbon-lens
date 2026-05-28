# CarbonLens

A platform for exploring, visualizing, and analyzing high-resolution carbon stock maps of Senegal, generated from multi-source satellite imagery (Sentinel-1, Sentinel-2, DEM) and Artificial Intelligence combined with field observations.

This mono-repository contains the system applications :

- [`api`](./api/) : Exposes geospatial endpoints to interact with carbon stock prediction maps at multiple administrative levels (regions, departments, communes, protected areas) for Senegal. It serves map tiles, GeoJSON boundaries, carbon statistics, file exports, and more ;

- [`web`](./web/) : The full-stack application developed in Next.js ;

- [`modeling`](./modeling/) : Carbon stock modeling pipeline, from field data to the COG map served via API.
