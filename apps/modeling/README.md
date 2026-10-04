# CarbonLens — ML Pipeline Documentation

Complete documentation of the carbon stock modeling pipeline in Senegal, from field data to the COG map served via API.


## Table of Contents

* [Overview](#overview)
* [Pipeline Architecture](#pipeline-architecture)
* [Prerequisites](#prerequisites)
* [File Structure](#file-structure)
* [Notebook 01 — Data Preparation](#notebook-01--data-preparation)
* [Notebook 02 — Feature Selection](#notebook-02--feature-selection)
* [Notebook 03 — Training](#notebook-03--training)
* [Notebook 04 — Inference](#notebook-04--inference)
* [Key Parameters](#key-parameters)
* [Produced Outputs](#produced-outputs)


## Overview

The objective is to estimate the **aboveground carbon stock (CAGB, in tC/ha)** across the entire Senegalese territory using multi-source satellite data and AI, relying on field measurements as a reference.

The pipeline breaks down as follows:

```
Field Data + Satellites  →  Data Preparation  →  Feature Selection
                                                   ↓
                          COG Map on GCS  ←  Inference  ←  Training
```

The final map is a **Cloud Optimized GeoTIFF (COG) at 10 m resolution**, stored in a public GCS bucket and dynamically served by a FastAPI via TiTiler.


## Pipeline Architecture

```
Data Preparation
   ├── Field data
   ├── Harmonization, deduplication, spatial filtering
   ├── Outlier detection and removal
   ├── GEE extraction: Sentinel-1, Sentinel-2 and DEM
   ├── Computation of spectral and radar indices
   └── Stratified train/test split (80/20)

Feature Selection
   ├── Variance filter
   ├── Correlation filter
   ├── Importance computation with 4 models: Lasso, LightGBM, CatBoost and GradientBoosting
   ├── Borda Count aggregation
   ├── Bootstrap stability analysis
   └── Final selection of relevant features

Training
   ├── Baseline CV with 3 models: ExtraTrees, RandomForest and XGBoost
   ├── Hyperparameter optimization with Optuna
   ├── Best model selection based on CV R²
   ├── Evaluation on test set
   └── Retraining on full data and saving of the best model

Inference
   ├── National GEE composite construction (S1 + S2 + DEM)
   ├── Export of raw tiles to GCS
   ├── Per-tile inference
   ├── Mosaicking and COG conversion
   ├── COG upload to GCS bucket
   ├── Zonal statistics computation for regions, departments, communes and protected areas
   ├── Enriched GeoJSON and CSV generation
   └── Update of data_index.csv file and cleanup
```


## Prerequisites

### Python Environment

```bash
pip install -r requirements.txt
```

The main ML pipeline dependencies are:

```
catboost
earthengine-api
geopandas
joblib
lightgbm
matplotlib
numpy
optuna
pandas
rasterio
rasterstats
rio-cogeo
scikit-learn
scipy
seaborn
xgboost
gdal
```

### Cloud Access

* A **Google Earth Engine (GEE) account** with authentication via a service account
* A **public Google Cloud Storage bucket**
* A service account JSON key file "gcp-sa-key.json" placed in the `secrets/` folder

### Required Initial Data

| File | Description |
|----|----|
| `data/sen/dataset_agb_mission_janvier_2026.csv` | Field measurements (January 2026 mission) |
| `data/sen/SYNTHESE_DATA_MCA.xlsx` | Field measurements (MCA synthesis) |
| `data/sen/gadm41_SEN_0.json` | Senegal border (GADM) |
| `data/sen/senegal_*_preds_2024-05.geojson` | Base administrative GeoJSONs (regions, departments, communes, protected areas) |
| `secrets/gcp-sa-key.json` | GCP Service Account key |


## File Structure

```
.
├── notebooks/
│   ├── 01_data_preparation_pipeline.ipynb
│   ├── 02_feature_selection_pipeline.ipynb
│   ├── 03_training_pipeline.ipynb
│   └── 04_inference_pipeline.ipynb
├── data/
│   └── sen/
│       ├── dataset_agb_mission_janvier_2026.csv          # Field input
│       ├── SYNTHESE_DATA_MCA.xlsx                        # Field input
│       ├── gadm41_SEN_0.json                             # Senegal border
│       ├── senegal_regions_preds_2024-05.geojson         # Base regions GeoJSON
│       ├── senegal_departments_preds_2024-05.geojson     # Base departments GeoJSON
│       ├── senegal_communes_preds_2024-05.geojson        # Base communes GeoJSON
│       ├── senegal_protected_areas_preds_2024-05.geojson # Base protected areas GeoJSON
│       ├── land_area.txt                                 # Total land area (ha)
│       ├── train.csv                                     # Training data (80%)
│       ├── test.csv                                      # Test data (20%)
│       ├── selected_features.txt                         # Selected features
│       ├── train_selected.csv                            # Training data with selected features
│       └── results.txt                                   # Results
├── models/                                               # Model storage
│   ├── extratrees_tuned_YYYYMMDD.pkl
│   ├── randomforest_tuned_YYYYMMDD.pkl
│   ├── xgboost_tuned_YYYYMMDD.pkl
│   └── BEST_<model>_YYYYMMDD.pkl
├── inference/
│   ├── raw_tiles/                                        # Raw tiles (temporary)
│   └── pred_tiles/                                       # Predicted tiles (temporary)
├── indices.py                                            # S1/S2 index computation
└── secrets/
    └── gcp-sa-key.json                                   # GCP key for service account
```


## Notebook 01 — Data Preparation

**File:** `01_data_preparation_pipeline.ipynb`

### Objective

Build a clean and complete dataset combining field measurements and satellite data, ready for feature selection and training.


### Step 1 — Loading and harmonizing field data

Two sources of field measurements are merged:

* **CSV** (January 2026 Mission): columns renamed to `inventory_date`, `latitude_proj`, `longitude_proj`, `agb`
* **Excel** (MCA Synthesis, 40 rows): same harmonization

Both sources are concatenated, exact duplicates (same date + coordinates) are removed. The CAGB (carbon AGB) value is computed using the formula:

```
CAGB = AGB × 0.47
```

Observations where CAGB exceeds 200 tC/ha are excluded as absolute outliers. An HCS/non-HCS categorization is applied according to carbon class thresholds.


### Step 2 — Spatial filtering

Field coordinates (projected in EPSG:32628) are converted to EPSG:4326, then a filter is applied to remove points located outside the borders of Senegal.

The total area of the inventoried plots is computed from their radius (16 m):

```
area = π × r² × n_plots / 10000  (in hectares)
```


### Step 3 — Outlier detection

Three complementary methods are applied to the AGB distribution:

| Method | Criterion |
|----|----|
| IQR | Value < Q1 − 1.5×IQR or > Q3 + 1.5×IQR |
| Z-score | \|(Value - mean) / SD\| > 3.0 |
| Modified Z-score | \|0.6745 × (Value − median) / MAD\| > 3.5 |

A point is considered an outlier only if it is flagged by **all 3 methods simultaneously**. Outliers are removed.


### Step 4 — Satellite extraction via Google Earth Engine

For each field point, a 16 m buffer is transformed into a polygon in GEE. The following data is extracted for the month corresponding to the inventory date:

| Source | GEE Collection | Extracted Bands | Aggregation |
|----|----|----|----|
| Sentinel-1 | `COPERNICUS/S1_GRD` | VV, VH | Temporal mean |
| Sentinel-2 | `COPERNICUS/S2_SR_HARMONIZED` | B1–B12 (excl. B10) | Temporal median |
| DEM SRTM | `USGS/SRTMGL1_003` | elevation | static |

**Applied preprocessing:**

* S1: image edge masking
* S2: cloud and cirrus masking, and scaling
* DEM: reprojection to 10 m
* Nodata value: −9999 if no image is available for the period


### Step 5 — Index computation

Spectral and radar indices are computed via `indices.py`:

```python
dataset = add_s2_indices(dataset)  # NDVI, EVI, SAVI, etc.
dataset = add_s1_indices(dataset)  # VVVHR, VHVVR, VVVHD, etc.
```


### Step 6 — Train/test split

The split is stratified on quantile bins of the target variable AGB, ensuring a similar distribution between both sets (validated by a Kolmogorov-Smirnov test, threshold p > 0.05).

```
TEST_SIZE = 0.20   for  80% train / 20% test
```

**Outputs:** `train.csv` and `test.csv`


## Notebook 02 — Feature Selection

**File:** `02_feature_selection_pipeline.ipynb`

### Objective

Identify the most informative and most stable feature subset for AGB regression, by combining several selection methods and validating robustness through bootstrap.


### Step 1 — Preliminary filters

**Variance filter**: any feature with a variance < 0.01 is removed (quasi-constant, non-informative features).

**Correlation filter**: among each pair of features with a Pearson coefficient > 0.90, the feature least correlated with the target AGB is removed, limiting redundancy in the model.


### Step 2 — Multi-model importance computation

Four models compute importances via KFold cross-validation (5 folds). For each fold and each model, raw importances are normalized then converted into reciprocal rank scores (1/rank), making scores comparable across architectures:

| Model | Importance Type |
|----|----|
| Lasso (optimal alpha via LassoCV) | Absolute value of coefficients |
| LightGBM (with early stopping) | Native feature importances |
| CatBoost | Native feature importances |
| GradientBoosting | Native feature importances |


### Step 3 — Borda Count aggregation

The ranks of each feature across all models are aggregated via a **Borda Count**: each feature accumulates a score inversely proportional to its rank in each model. The final score reflects multi-model consensus.

The optimal number of features N is automatically determined as the minimum covering **80% of the cumulative Borda score**.


### Step 4 — Bootstrap stability analysis

**50 bootstrap repetitions** (resampling with replacement) are performed. For each repetition, the entire importance pipeline is recomputed and the top-N features are selected. The **selection frequency** of each feature measures its robustness to dataset perturbations.

A feature is considered **stable** if it appears in at least 70% of the bootstrap repetitions.

**Final selection strategy**: only stable features (frequency ≥ 70%) among the top-N Borda are retained.

**Outputs:** `selected_features.txt` and `train_selected.csv`


## Notebook 03 — Training

**File:** `03_training_pipeline.ipynb`

### Objective

Train and select the best regression model to predict AGB from the selected features.


### Step 1 — Baseline

The three candidate models are evaluated without tuning via `cross_val_predict` (KFold 5):

* **ExtraTreesRegressor**
* **RandomForestRegressor**
* **XGBRegressor**

The reported metrics are R², RMSE and MAE.


### Step 2 — Optuna optimization

Each model is independently optimized via **Optuna**.

**Search spaces:**

*ExtraTrees & RandomForest:*

* `n_estimators`: \[100, 1000\]
* `max_depth`: \[5, 50\]
* `min_samples_split`: \[2, 20\]
* `min_samples_leaf`: \[1, 10\]
* `max_features`: {sqrt, log2, None}
* `bootstrap`: {True, False}

*XGBoost:*

* `max_depth`: \[3, 10\]
* `learning_rate`: \[1e-3, 0.3\] (log)
* `n_estimators`: \[100, 1000\]
* `reg_lambda`: \[1e-3, 10\] (log)
* `subsample`: \[0.5, 1.0\]
* `colsample_bytree`: \[0.5, 1.0\]


### Step 3 — Selection and evaluation

The best model is selected based on the **Optuna CV R²** (best value among the 3 studies). It is then evaluated on the **reserved test set** (never seen during tuning).

Results are saved in `results.txt`.


### Step 4 — Final retraining

The three tuned models are **retrained on the full dataset (train + test)** to maximize the amount of data available for spatial prediction. All models are saved as `.pkl` via `joblib`. The best one is also saved separately with the `BEST_` prefix.

**Outputs:** `models/BEST_<model>_YYYYMMDD.pkl`, `models/<model>_tuned_YYYYMMDD.pkl` and `results.txt`


## Notebook 04 — Inference

**File:** `04_inference_pipeline.ipynb`

### Objective

Apply the trained model at national scale to produce a 10 m CAGB map in COG format, enrich the administrative GeoJSONs with zonal statistics, and update the data index served by the API.


### Step 1 — National GEE composite construction

For the inference period, a multi-source composite is built over the entire territory of Senegal:

| Source | Aggregation | Filters |
|----|----|----|
| Sentinel-1 (VV, VH) | Temporal mean | IW mode, ascending pass, edge mask −30 dB |
| Sentinel-2 (B1–B12 excl. B10) | Temporal median | Cloud cover < 15%, QA60 mask |
| DEM SRTM (elevation) | Static | Reprojection to 10 m |

The three sources are stacked into a multi-band image; pixels with no data are filled with the nodata value (−9999).


### Step 2 — Export of raw tiles to GCS

The GEE image is exported to GCS as GeoTIFF tiles (EPSG:3857, 10 m) via `ee.batch.Export.image.toCloudStorage`. A monitoring function tracks the task status (READY → RUNNING → COMPLETED) with polling every 15 seconds by default.

**Destination:** `gs://carbonlens-bucket/v1/senegal/feature_tiles/`


### Step 3 — Per-tile inference

Each tile is processed independently:


1. **Download** of the raw tile from GCS
2. **Reading** and reshaping of bands into a DataFrame
3. **Index computation** of spectral (S2) and radar (S1) indices via `indices.py`
4. **AGB prediction** with the `.pkl` model on valid pixels only
5. **CAGB conversion**: `CAGB = AGB_pred × 0.47`
6. **Saving** of the prediction tile
7. **Deletion** of the local raw tile

Nodata pixels or pixels with non-finite values are excluded from inference and receive the nodata value in output.


### Step 4 — Mosaicking and COG conversion

The prediction tiles are merged with `rasterio.merge`. The mosaic is then converted to a **Cloud Optimized GeoTIFF** via `rio_cogeo`:

* Compression: Deflate
* Blocks: 512×512 pixels
* Overviews: 5 levels (`nearest` resampling)
* Web optimization: enabled
* Format: Float32, BigTIFF

**GDAL validation**: number of bands, dimensions and overview levels are checked before upload.

**Upload destination:** `gs://carbonlens-bucket/v1/senegal/maps/carbon_pred_{PERIOD}_10m_COG.tif`


### Step 5 — Update of data_index.csv

The centralized `data_index.csv` file in GCS is updated with a new entry containing:

| Field | Description |
|----|----|
| `date` | Inference period (YYYY-MM) |
| `res` | Resolution (`10m`) |
| `country` | Country (`senegal`) |
| `url` | Public URL of the COG |
| `carbon_mean` | National CAGB mean (tC/ha) |
| `land_area` | Land landscape area (ha) |
| `ol / s / yrf / ldf / mdf / hdf` | Number of pixels per carbon class |
| `total` | Total number of valid pixels |

Existing entries for the same date are replaced (`keep='last'`).


### Step 6 — Zonal statistics and GeoJSON computation

For each administrative level (regions, departments, communes, protected areas), the following zonal statistics are computed on the COG via `rasterstats.zonal_stats`:

`carbon_mean`, `carbon_min`, `carbon_max`, `carbon_median`, `carbon_std`, `carbon_pixel_count`

The base GeoJSONs are enriched with these columns, saved locally and then uploaded to GCS:

* `gs://carbonlens-bucket/v1/senegal/regions/senegal_regions_preds_{PERIOD}.geojson`
* `gs://carbonlens-bucket/v1/senegal/departments/senegal_departments_preds_{PERIOD}.geojson`
* `gs://carbonlens-bucket/v1/senegal/communes/senegal_communes_preds_{PERIOD}.geojson`
* `gs://carbonlens-bucket/v1/senegal/protected_areas/senegal_protected_areas_preds_{PERIOD}.geojson`

Equivalent CSV files are also produced and uploaded to the same GCS prefixes.


### Step 7 — Cleanup

The raw GCS tiles from the `feature_tiles/` prefix are deleted after validating that the COG is present in the bucket. Local temporary files (prediction tiles, GeoJSONs, CSVs) are also deleted.


## Key Parameters

| Parameter | Value | Notebook | Description |
|----|----|----|----|
| `SEED` | 42 | 01, 02, 03 | Reproducibility seed |
| `TEST_SIZE` | 0.20 | 01 | Test set proportion |
| `RADIUS` | 16 m | 01 | Buffer radius of field points |
| `THRESHOLD` (S2) | 15% | 01, 04 | Max S2 cloud cover |
| `CAGB_THRESHOLD` | 200 tC/ha | 01 | Absolute outlier filtering threshold |
| `CONSENSUS` | 3 | 01 | Methods required to declare an outlier |
| `VAR_THRESHOLD` | 0.01 | 02 | Minimum variance to keep a feature |
| `CORR_THRESHOLD` | 0.90 | 02 | Max correlation between features |
| `N_FEATURES` | 12 | 02 | Max number of features to select |
| `BORDA_COVERAGE` | 0.80 | 02 | Target coverage of Borda score |
| `N_BOOTSTRAP` | 50 | 02 | Repetitions for stability analysis |
| `STABILITY_THRESHOLD` | 0.70 | 02 | Min frequency for a feature to be stable |
| `N_SPLITS` | 5 | 02, 03 | Number of KFold folds |
| `N_TRIALS` | 50 | 03 | Optuna trials per model |
| `GEE_SCALE` | 10 m | 04 | GEE export resolution |
| `MAX_AGB` | 500 t/ha | 04 | Max clipping value of predictions |
| `N_WORKERS` | 4 | 04 | Parallel workers for inference |
| `NODATA` | −9999 | 01, 04 | Nodata value in rasters |


## Produced Outputs

| File | Produced by | Description |
|----|----|----|
| `train.csv` | Notebook 01 | Training data with satellite features |
| `test.csv` | Notebook 01 | Test data |
| `land_area.txt` | Notebook 01 | Total area of the studied landscape (ha) |
| `selected_features.txt` | Notebook 02 | List of selected features |
| `train_selected.csv` | Notebook 02 | train.csv filtered to selected features |
| `results.txt` | Notebook 03 | Best model metrics (R², RMSE, MAE) |
| `models/BEST_*.pkl` | Notebook 03 | Best trained model |
| `models/*_tuned_*.pkl` | Notebook 03 | All tuned models |
| `carbon_pred_{PERIOD}_10m_COG.tif` | Notebook 04 | National CAGB COG map (GCS) |
| `senegal_*_preds_{PERIOD}.geojson` | Notebook 04 | GeoJSONs enriched by administrative level (GCS) |
| `senegal_*_preds_{PERIOD}.csv` | Notebook 04 | Equivalent CSVs (GCS) |
| `data_index.csv` | Notebook 04 | Updated index of available COGs (GCS) |


