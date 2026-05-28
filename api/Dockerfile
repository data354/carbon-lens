# Use a lightweight Python base image
FROM python:3.12-slim AS builder

# Set working directory in the container
WORKDIR /app

# # Install system dependencies for rasterio and titiler
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gdal-bin \
    libexpat1 \
    libexpat1-dev \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (to leverage Docker layer caching)
COPY ./requirements.txt /tmp/requirements.txt

# Install dependencies without cache
RUN python3 -m pip install --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
    rm -r /tmp/requirements.txt

# Copy the rest of the application code
COPY config.yml config.yml
COPY main.py main.py
COPY models.py models.py
COPY core core
COPY utils utils
COPY factories factories
COPY routers routers
COPY data data

# Final stage
FROM python:3.12-slim

# Set working directory in the container
WORKDIR /app

# Install runtime dependencies only (without build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libexpat1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /app /app

# Set environment variables
EXPOSE 8080

# Start FastAPI with Uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]