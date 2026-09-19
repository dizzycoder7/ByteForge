# ByteForge — Competitive Programming Platform

A full-stack competitive programming platform built with **Java 21 + Spring Boot** (backend) and **React + Vite** (frontend), using **MySQL** for persistence and **JWT** for stateless authentication.

## Project Structure

```
Major_project/
├── backend/    → Spring Boot REST API (port 8080)
└── frontend/   → React + Vite SPA (port 5173)
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Java 21, Spring Boot 3, Spring Security |
| Auth       | JWT (JJWT), BCrypt                  |
| Database   | MySQL 8, Spring Data JPA, Hibernate |
| Frontend   | React 18, Vite, Axios               |
| Build      | Maven (backend), npm (frontend)     |

## Getting Started

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 18+
- MySQL 8

### Backend Setup
```bash
cd backend
cp .env.example .env          # fill in your DB credentials & JWT secret
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `backend/.env.example` for required variables. **Never commit `.env`.**
