# Docker Setup Instructions

This document provides instructions for setting up and running the ALNS API service using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic knowledge of Docker commands

## Running the Service

1. Open a terminal/command prompt in this directory (AlnsCloud_v5.2)

2. Build and start the container:
   ```
   docker-compose up -d
   ```

3. Check if the container is running:
   ```
   docker-compose ps
   ```

4. View logs:
   ```
   docker-compose logs -f
   ```

5. Test the API by opening a browser and navigating to:
   - http://localhost:8005/health
   - http://localhost:8005/hello

## Stopping the Service

To stop the container:
