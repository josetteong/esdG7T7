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
## Environment Files

- Central file: `.env` in this folder (loaded by Docker Compose).
- Example template: `.env.example` (copy/adjust for new setups).
- Frontend local env (`food-rescue-platform/.env.local`) is generated from the central `.env` via a small sync script.

Sync commands:

- From the frontend dir: `npm run env:sync`
- Or directly: `node ./scripts/env-sync.mjs`

Notes:
- Only `VITE_*` keys are propagated to the frontend file.
- Edit values in `.env` and re-run the sync when they change.

## Supabase (External Postgres)

When `.env` points to Supabase (DB_HOST ends with `supabase.com`), the stack does not run a local Postgres. To apply schema and seed to Supabase for local dev:

- Windows (PowerShell): `./esdG7T7/scripts/db-apply-supabase.ps1`
- macOS/Linux: `bash esdG7T7/scripts/db-apply-supabase.sh`

These read credentials from `esdG7T7/.env` and run `psql` in a temporary `postgres:15-alpine` container with `sslmode=require`.

