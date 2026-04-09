# Food Rescue Platform

A microservices-based web application connecting food vendors with NGOs and beneficiaries to redistribute surplus food before expiration — reducing food waste and supporting communities in need.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)

---

## Overview

The Food Rescue Platform enables vendors (restaurants, supermarkets, etc.) to list surplus food items that are near expiry. Claimants (NGOs and individuals) can browse and reserve these listings for pickup. The platform handles the full lifecycle:

- Vendor registration and food listing management
- Claimant/NGO registration and reservation flow
- Collection tracking and confirmation
- Strike system for missed pickups (3 strikes = suspension/ban)
- Telegram-based notifications throughout the workflow
- Automatic expiry monitoring and cascading cancellations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| Backend (core) | FastAPI 0.104, Python 3.11, SQLAlchemy |
| Backend (support) | Flask 3.1, Flasgger (Swagger docs) |
| Database | PostgreSQL 15 via Supabase |
| Message Queue | RabbitMQ 3 |
| API Gateway | Kong (declarative config) |
| Scheduling | APScheduler 3.10 |
| Notifications | Telegram Bot API |
| Containerization | Docker + Docker Compose |

---

## Services

| Service | Port | Framework | Responsibility |
|---|---|---|---|
| `listing-service` | 8001 | FastAPI | Food listing CRUD and status management |
| `reservation-service` | 8002 | FastAPI | Reservation creation and lifecycle |
| `strike-service` | 8003 | FastAPI | Claimant strike tracking and eligibility |
| `notification-service` | 8004 | FastAPI | Notification logging and delivery |
| `expiry-monitor-service` | 8005 | Flask | Cron job to expire stale listings |
| `registration-service` | 8006 | Flask | Claimant/vendor registration + Telegram setup |
| `handle-cancellation-service` | 8007 | Flask | Grace/non-grace/vendor cancellation handling |
| `reserve-composite-service` | 8008 | FastAPI | Orchestrates reservation (eligibility → reserve → notify) |
| `collection-service` | 8009 | Flask | Records food collection events |
| `collection-monitoring-service` | 8010 | Flask | Monitors overdue collections |
| `vendor-service` | 8011 | Flask | Vendor account management and login |
| `claimant-service` | 8012 | Flask | Claimant account management and login |
| `striking-svc` | 8013 | Flask | Alternative strike application service |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ and npm 9+
- A Supabase project (or PostgreSQL instance)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd esdG7T7
```

### 2. Configure Environment Variables

The environment variables are provided in `esdG7T7/.env.txt`. Copy the contents into a new file named `.env` in the same directory:

```bash
cp esdG7T7/env.txt esdG7T7/.env
```

See [Environment Variables](#environment-variables) for details on each variable.

### 3. Deploy Notification Service to OutSystems

1. Open [OutSystems Service Studio](https://www.outsystems.com/downloads/)
2. Log in to your OutSystems environment
3. Go to **File > Open** and select `G7T7_Smart Food Rescue.oap`
4. Click **1-Click Publish** to deploy the application to your environment

### 4. Start Backend Services

```bash
cd esdG7T7
docker compose up --build
```

All services will start on their respective ports. The Kong API Gateway is accessible at `http://localhost:9000`.

### 5. Start the Frontend

```bash
cd food-rescue-platform
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## API Reference

All endpoints are routed through Kong at `http://localhost:9000`.

### Listings

| Method | Path | Description |
|---|---|---|
| `POST` | `/listings` | Create a new food listing |
| `GET` | `/listings` | Get all listings |
| `GET` | `/listings/{id}` | Get a specific listing |
| `PATCH` | `/listings/{id}/reserve` | Reserve quantity |
| `PATCH` | `/listings/{id}/release` | Release reserved quantity |
| `PATCH` | `/listings/{id}/mark-collected` | Mark as collected |
| `PATCH` | `/listings/{id}/expire` | Expire a listing |
| `PATCH` | `/listings/{id}/cancel` | Cancel a listing |

### Reservations

| Method | Path | Description |
|---|---|---|
| `POST` | `/reservations` | Create a reservation |
| `GET` | `/reservations` | Get all reservations |
| `GET` | `/reservations/{id}` | Get a specific reservation |
| `PATCH` | `/reservations/{id}/complete` | Mark as completed |
| `PATCH` | `/reservations/{id}/cancel` | Cancel a reservation |
| `PATCH` | `/reservations/{id}/missed-pickup` | Mark as missed pickup |
| `PATCH` | `/reservations/cancel-by-listing/{listing_id}` | Cancel all reservations for a listing |

### Reserve (Composite — rate limited: 10 req/min)

| Method | Path | Description |
|---|---|---|
| `POST` | `/reserve` | Orchestrated reservation: checks eligibility, creates reservation, sends notification |

### Strikes (rate limited: 10 req/min)

| Method | Path | Description |
|---|---|---|
| `POST` | `/strikes/apply` | Apply a strike to a claimant |
| `GET` | `/strikes/{claimant_id}` | Get strike count |
| `GET` | `/strikes/{claimant_id}/eligibility` | Check eligibility (`ACTIVE` / `SUSPENDED`) |

### Claimants

| Method | Path | Description |
|---|---|---|
| `POST` | `/claimants` | Create claimant account |
| `GET` | `/claimants/{id}` | Get claimant details |
| `POST` | `/claimants/login` | Claimant login |
| `PATCH` | `/claimants/{id}/apply-strike` | Apply strike to claimant |

### Vendors

| Method | Path | Description |
|---|---|---|
| `POST` | `/vendors` | Create vendor account |
| `GET` | `/vendors/{id}` | Get vendor details |
| `POST` | `/vendors/login` | Vendor login |

### Registrations

| Method | Path | Description |
|---|---|---|
| `POST` | `/registrations/claimant` | Register claimant (creates account + Telegram setup) |
| `POST` | `/registrations/vendor` | Register vendor (creates account + Telegram setup) |
| `GET` | `/registrations/{user_id}/{type}` | Get registration status |
| `POST` | `/registrations/{user_id}/{type}/reconnect` | Reconnect Telegram |

### Cancellations

| Method | Path | Description |
|---|---|---|
| `POST` | `/claimant/cancel` | Claimant cancels a reservation |
| `POST` | `/vendor/cancel` | Vendor cancels a listing |

### Collections

| Method | Path | Description |
|---|---|---|
| `POST` | `/collect` | Record a food collection |

---

## Database Schema

Key tables in PostgreSQL:

| Table | Description |
|---|---|
| `vendors` | Vendor accounts (`ACTIVE` / `SUSPENDED`) |
| `claimants` | Claimant accounts|
| `listings` | Food listings with expiry, quantity, and status |
| `reservations` | Reservation records linked to listings and claimants |
| `strikes` | Strike records per claimant |
| `notifications` | Log of all sent notifications |
| `registrations` | Telegram registration state per user |

**Listing statuses:** `AVAILABLE`, `FULLY_RESERVED`, `COLLECTED`, `EXPIRED`, `CANCELLED`

**Reservation statuses:** `RESERVED`, `COMPLETED`, `CANCELLED`, `MISSED_PICKUP`, `EXPIRED`

**Eligibility statuses:** `ACTIVE`, `SUSPENDED`

---

## Environment Variables

| Variable | Description |
|---|---|
| `RABBITMQ_USER` | RabbitMQ username |
| `RABBITMQ_PASS` | RabbitMQ password |
| `RABBITMQ_URL` | RabbitMQ connection URL (`amqp://...`) |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | PostgreSQL database name |
| `DATABASE_URL` | Full SQLAlchemy connection string |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications |
| `TELEGRAM_CHAT_ID` | Default Telegram chat ID |

---

## API Documentation

- **FastAPI services**: `http://localhost:{port}/docs` (Swagger UI)
- **Flask services**: `http://localhost:{port}/apidocs` (Flasgger)
- **RabbitMQ Management**: `http://localhost:15672`
- **Kong Admin**: `http://localhost:9001`
