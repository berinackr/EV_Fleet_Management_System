#!/bin/bash

# This script is for local development, starting the ALNS API service

# Create sample data if it doesn't exist
python create_sample_data.py

# Run the API server
uvicorn server:app --host 0.0.0.0 --port 8005 --reload
