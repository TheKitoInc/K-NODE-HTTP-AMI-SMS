#!/usr/bin/env bash

# Exit on error
set -e

# Change working directory to the script's location
cd "$(dirname "$0")"

# Build the Docker image
docker build .
ID_IMAGE=$(docker build -q .)
echo "Image built with ID: $ID_IMAGE"

# Run the container
docker run --rm -it -p 3571:3000 $ID_IMAGE