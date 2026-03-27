# ESD Microservices Project

This is a food listing and reservation system built with Python FastAPI microservices.

## Services

- **listing-service**: Manages food listings, quantities, and statuses. Port 8001
- **reservation-service**: Handles reservations and their statuses. Port 8002
- **strike-service**: Manages claimant strikes and eligibility. Port 8003
- **notification-service**: Sends and records notifications. Port 8004
- **reserve-composite-service**: Orchestrator of strike, listing, reservation, notification service

## Setup

1. Ensure Docker and Docker Compose are installed.
2. Clone the repository.
3. Run `docker-compose up --build` to start all services.

## Development

Each service can be run individually:

cd <service-name>
pip install -r requirements.txt
uvicorn src.main:app --reload

Run tests: pytest

## API Documentation

Each service provides OpenAPI docs at /docs when running.