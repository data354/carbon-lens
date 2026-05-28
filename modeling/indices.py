"""Shared module for spectral (Sentinel-2) and radar (Sentinel-1) index computation."""

import numpy as np

EPS = 1e-9

def safe_ratio(num, denom, use_abs=True, eps=1e-9):
    """
    return num / denom, where denom values with |denom| <= eps (or denom <= eps)
    are replaced by eps to avoid division by zero.
    """
    if use_abs:
        denom = denom.where(np.abs(denom) > eps, eps)
    else:
        denom = denom.where(denom > eps, eps)
    return num / denom

def add_s2_veg_indices(df_arg, L=0.5, y_arg=0.126, a=0.3, b=0.5):
    """
    Compute Sentinel-2 spectral vegetation indices and append them to the DataFrame.
    """
    X = df_arg.copy()
    X = X.replace([np.inf, -np.inf], np.nan)

    # ARI
    X["ARI"] = safe_ratio(1, X.B3, use_abs=False) - safe_ratio(1, X.B5, use_abs=False)
    # ARVI
    num_arvi = X.B8 - X.B4 - y_arg * (X.B4 - X.B2)
    den_arvi = X.B8 + X.B4 - y_arg * (X.B4 - X.B2)
    X["ARVI"] = safe_ratio(num_arvi, den_arvi, use_abs=True)
    # AVI
    avi_raw = X.B8 * (1 - X.B4) * (X.B8 - X.B4)
    X["AVI"] = np.sign(avi_raw) * np.abs(avi_raw) ** (1/3)
    # BCC
    X["BCC"] = safe_ratio(X.B2, X.B4 + X.B3 + X.B2, use_abs=False)
    # CCCI
    ratio1 = safe_ratio(X.B8 - X.B5, X.B8 + X.B5, use_abs=True)
    ratio2 = safe_ratio(X.B8 - X.B4, X.B8 + X.B4, use_abs=True)
    X["CCCI"] = safe_ratio(ratio1, ratio2, use_abs=True)
    # CVI
    X["CVI"] = (X.B8 * X.B4) * (X.B3 ** 2)
    # EVI
    den_evi = X.B8 + 6 * X.B4 - 7.5 * X.B2 + 1
    X["EVI"] = 2.5 * safe_ratio(X.B8 - X.B4, den_evi, use_abs=True)
    # ExG
    X["ExG"] = 2 * X.B3 - X.B4 - X.B2
    # GNDVI
    X["GNDVI"] = safe_ratio(X.B8 - X.B3, X.B8 + X.B3, use_abs=True)
    # IKAW
    X["IKAW"] = safe_ratio(X.B8 - X.B2, X.B8 + X.B2, use_abs=True)
    # MCARI
    mcari_part = (X.B5 - X.B4) - 0.2 * (X.B5 - X.B3)
    X["MCARI"] = mcari_part * safe_ratio(X.B5, X.B4, use_abs=False)
    # MSAVI
    inner = (2 * X.B8 + 1) ** 2 - 8 * (X.B8 - X.B4)
    inner = np.maximum(inner, 0)
    X["MSAVI"] = 0.5 * (2 * X.B8 + 1 - np.sqrt(inner))
    # MTVI2
    num_mtvi2 = 1.5 * (1.2 * (X.B8 - X.B3) - 2.5 * (X.B4 - X.B3))
    den_mtvi2 = ((2 * X.B8 + 1)**2) - (6 * X.B8 - 5 * (X.B4**0.5)) - 0.5
    den_mtvi2 = np.maximum(den_mtvi2, EPS)
    X["MTVI2"] = safe_ratio(num_mtvi2, den_mtvi2, use_abs=True)
    # NDDI
    R1 = safe_ratio(X.B8 - X.B4, X.B8 + X.B4, use_abs=True)
    R2 = safe_ratio(X.B3 - X.B8, X.B3 + X.B8, use_abs=True)
    X["NDDI"] = safe_ratio(R1 - R2, R1 + R2, use_abs=True)
    # NDMI
    X["NDMI"] = safe_ratio(X.B8 - X.B11, X.B8 + X.B11, use_abs=True)
    # NDVI
    X["NDVI"] = safe_ratio(X.B8 - X.B4, X.B8 + X.B4, use_abs=True)
    # NDYI
    X["NDYI"] = safe_ratio(X.B3 - X.B2, X.B3 + X.B2, use_abs=True)
    # PSRI
    X["PSRI"] = safe_ratio(X.B4 - X.B2, X.B6, use_abs=True)
    # PVI
    X["PVI"] = (X.B8 - a * X.B4 - b) / np.sqrt(1 + a**2)
    # RCC
    X["RCC"] = safe_ratio(X.B4, X.B4 + X.B3 + X.B2, use_abs=False)
    # RENDVI
    X["RENDVI"] = safe_ratio(X.B6 - X.B5, X.B6 + X.B5, use_abs=True)
    # S2REP
    num_s2rep = ((X.B7 + X.B4) / 2) - X.B5
    X["S2REP"] = 705 + 35 * safe_ratio(num_s2rep, X.B6 - X.B5, use_abs=True)
    # SAVI
    X["SAVI"] = (1 + L) * safe_ratio(X.B8 - X.B4, X.B8 + X.B4 + L, use_abs=True)
    # SI
    si_prod = (1 - X.B2) * (1 - X.B3) * (1 - X.B4)
    X["SI"] = np.sign(si_prod) * np.abs(si_prod) ** (1/3)
    # SIPI
    X["SIPI"] = safe_ratio(X.B8 - X.B1, X.B8 - X.B4, use_abs=True)
    # TCARI
    tcari_base = 3 * ((X.B5 - X.B4) - 0.2 * (X.B5 - X.B3))
    X["TCARI"] = tcari_base * safe_ratio(X.B5, X.B4, use_abs=False)
    # TNDVI
    tndvi_inner = safe_ratio(X.B8 - X.B4, X.B8 + X.B4, use_abs=True) + 0.5
    tndvi_inner = np.maximum(tndvi_inner, 0)
    X["TNDVI"] = np.sqrt(tndvi_inner)
    # TTVI
    X["TTVI"] = 0.5 * ((865 - 740) * (X.B7 - X.B6) - (X.B8A - X.B6) * (783 - 740))
    # TVI
    tvi_inner = safe_ratio(X.B8 - X.B4, X.B8 + X.B4, use_abs=True) + 0.5
    tvi_inner = np.maximum(tvi_inner, 0)
    X["TVI"] = np.sqrt(tvi_inner)
    # VARI
    X["VARI"] = safe_ratio(X.B3 - X.B4, X.B3 + X.B4 - X.B2, use_abs=True)
    # VARI700
    num_var700 = X.B5 - 1.7 * X.B4 + 0.7 * X.B2
    den_var700 = X.B5 + 1.3 * X.B4 - 1.3 * X.B2
    X["VARI700"] = safe_ratio(num_var700, den_var700, use_abs=True)

    X = X.replace([np.inf, -np.inf], np.nan)

    return X

def add_s2_water_indices(df_arg):
    """
    Compute Sentinel-2 spectral water indices and append them to the DataFrame.
    """
    X = df_arg.copy()
    X = X.replace([np.inf, -np.inf], np.nan)

    # AWEInsh
    X["AWEInsh"] = 4 * (X.B3 - X.B11) - 0.25 * X.B8 + 2.75 * X.B12
    # AWEIsh
    X["AWEIsh"] = X.B2 + 2.5 * X.B3 - 1.5 * (X.B8 + X.B11) - 0.25 * X.B12
    # MNDWI
    X["MNDWI"] = safe_ratio(X.B3 - X.B11, X.B3 + X.B11, use_abs=True)
    # MuWIR
    term1 = -4 * safe_ratio(X.B2 - X.B3, X.B2 + X.B3, use_abs=True)
    term2 =  2 * safe_ratio(X.B3 - X.B8, X.B3 + X.B8, use_abs=True)
    term3 =  2 * safe_ratio(X.B3 - X.B12, X.B3 + X.B12, use_abs=True)
    term4 = -1 * safe_ratio(X.B3 - X.B11, X.B3 + X.B11, use_abs=True)
    X["MuWIR"] = term1 + term2 + term3 + term4
    # NDWI
    X["NDWI"] = safe_ratio(X.B3 - X.B8, X.B3 + X.B8, use_abs=True)
    # S2WI
    X["S2WI"] = safe_ratio(X.B5 - X.B12, X.B5 + X.B12, use_abs=True)
    # WI2015
    X["WI2015"] = 1.7204 + 171 * X.B3 + 3 * X.B4 - 70 * X.B8 - 45 * X.B11 - 71 * X.B12

    X = X.replace([np.inf, -np.inf], np.nan)

    return X

def add_s2_other_indices(df_arg, L=0.5, eps=1e-9):
    """
    Compute Sentinel-2 spectral indices (burn/fire, snow, urban, soil)
    and append them to the DataFrame.
    """
    X = df_arg.copy()
    X = X.replace([np.inf, -np.inf], np.nan)

    # BURN / FIRE INDICES

    ## BAI
    denom_bai = (0.1 - X.B4)**2 + (0.06 - X.B8)**2
    denom_bai = denom_bai.where(denom_bai > eps, eps)
    X["BAI"] = 1 / denom_bai
    ## BAIM
    denom_baim = (0.05 - X.B8)**2 + (0.2 - X.B12)**2
    denom_baim = denom_baim.where(denom_baim > eps, eps)
    X["BAIM"] = 1 / denom_baim
    ## MIRBI
    X["MIRBI"] = 10 * X.B12 - 9.8 * X.B11 + 2
    ## NBR
    X["NBR"] = safe_ratio(X.B8 - X.B12, X.B8 + X.B12, use_abs=True)
    ## NBRplus
    X["NBRplus"] = safe_ratio(X.B12 - X.B8A - X.B3 - X.B2,
                              X.B12 + X.B8A + X.B3 + X.B2,
                              use_abs=True)
    ## NBRSWIR
    num_nbrswir = X.B12 - X.B11 - 0.02
    den_nbrswir = X.B12 + X.B11 + 0.1
    X["NBRSWIR"] = safe_ratio(num_nbrswir, den_nbrswir, use_abs=True)
    ## NDSWIR
    X["NDSWIR"] = safe_ratio(X.B8 - X.B11, X.B8 + X.B11, use_abs=True)

    # SNOW INDICES

    ## NBSIMS
    X["NBSIMS"] = (0.36 * (X.B3 + X.B4 + X.B8) -
                   (safe_ratio(X.B2 + X.B12, X.B3, use_abs=True) + X.B11))
    ## NDSI
    X["NDSI"] = safe_ratio(X.B3 - X.B11, X.B3 + X.B11, use_abs=True)

    # URBAN INDICES

    ## NBAI
    ratio_b11_b3 = safe_ratio(X.B11, X.B3, use_abs=True)
    X["NBAI"] = safe_ratio(X.B12 - ratio_b11_b3, X.B12 + ratio_b11_b3, use_abs=True)
    ## NDBI
    X["NDBI"] = safe_ratio(X.B11 - X.B8, X.B11 + X.B8, use_abs=True)
    ## UI
    X["UI"] = safe_ratio(X.B12 - X.B8, X.B12 + X.B8, use_abs=True)

    # SOIL INDICES

    ## BI
    num_bi = (X.B11 + X.B4) - (X.B8 + X.B2)
    den_bi = (X.B11 + X.B4) + (X.B8 + X.B2)
    X["BI"] = safe_ratio(num_bi, den_bi, use_abs=True)
    ## BI2
    bi2_inner = (X.B4**2 + X.B3**2 + X.B8**2) / 3
    bi2_inner = np.maximum(bi2_inner, 0)
    X["BI2"] = np.sqrt(bi2_inner)
    ## BSI
    num_bsi = (X.B12 + X.B4) - (X.B8 + X.B2)
    den_bsi = (X.B12 + X.B4) + (X.B8 + X.B2)
    X["BSI"] = safe_ratio(num_bsi, den_bsi, use_abs=True)
    ## SATVI
    satvi_base = safe_ratio(X.B11 - X.B4, X.B11 + X.B4 + L, use_abs=True) * (1 + L)
    X["SATVI"] = satvi_base - (X.B12 / 2)

    X = X.replace([np.inf, -np.inf], np.nan)

    return X

def add_s2_indices(df_arg):
    """
    Compute Sentinel-2 spectral indices and append them to the DataFrame.
    Covers vegetation, water, burn/fire, snow, urban and soil indices.
    """
    X = df_arg.copy()

    # Vegetation indices
    X = add_s2_veg_indices(X)
    # Water indices
    X = add_s2_water_indices(X)
    # Burn / Fire, Snow, Urbanand Soil indices
    X = add_s2_other_indices(X)

    return X

def add_s1_indices(df_arg):
    """Compute Sentinel-1 radar indices and append them to the DataFrame."""
    X = df_arg.copy()
    X = X.replace([np.inf, -np.inf], np.nan)

    # DPDD
    X["DPDD"] = (X.VV + X.VH) / np.sqrt(2)
    # DpRVIVV
    X["DpRVIVV"] = safe_ratio(4 * X.VH, X.VV + X.VH, use_abs=True)
    # NDPolI
    X["NDPolI"] = safe_ratio(X.VV - X.VH, X.VV + X.VH, use_abs=True)
    # VDDPI
    X["VDDPI"] = safe_ratio(X.VV + X.VH, X.VV, use_abs=True)
    # VHVVD
    X["VHVVD"] = X.VH - X.VV
    # VHVVP
    X["VHVVP"] = X.VH * X.VV
    # VHVVR
    X["VHVVR"] = safe_ratio(X.VH, X.VV, use_abs=True)
    # VVVHD
    X["VVVHD"] = X.VV - X.VH
    # VVVHR
    X["VVVHR"] = safe_ratio(X.VV, X.VH, use_abs=True)
    # VVVHS
    X["VVVHS"] = X.VV + X.VH

    X = X.replace([np.inf, -np.inf], np.nan)

    return X
