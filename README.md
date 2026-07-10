# Restaurant Reservation Management System

## Overview

A full-stack restaurant reservation system built with React frontend, Node.js/Express backend, and MongoDB database. Supports customer and admin user roles, table management, and reservation conflict handling.

## Tech Stack

- **Frontend**: React, React Router, Axios, Vite
- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt
- **Database**: MongoDB

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB running locally on port 27017 (or use MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in backend directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/restaurant-reservation
   JWT_SECRET=your-secret-key-here
   ```
   Note: Replace `your-secret-key-here` with a secure secret.

4. Start backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start frontend dev server:
   ```bash
   npm run dev
   ```
   The app will open on http://localhost:3000

## Usage

1. Register as an admin first to create tables
2. Create some tables in the admin dashboard
3. Register a customer account
4. Use the customer account to create reservations
5. Admins can view, edit, and cancel any reservation, and manage tables

## Key Features

### Reservation and Availability Logic
- Prevents double-booking the same table for the same date and time slot
- Validates that table capacity is sufficient for number of guests
- Confirmed and cancelled statuses
- Time slots: 12:00,13:00,14:00,18:00,19:00,20:00,21:00

### Role-based Access Control
- **Customer**: Create, view, and cancel own reservations
- **Admin**: View all reservations, filter by date, update/cancel any reservation, manage tables

## Assumptions
- Single restaurant
- Predefined time slots
- Tables are created by admins
- Reservations are for a single date and time slot

## Known Limitations
- No email notifications
- No real-time updates
- Simple UI (no advanced styling)
- No payment integration
- Table edit/delete not fully implemented (only add currently)

## Areas for Improvement with Additional Time
- Email confirmations and reminders
- Real-time availability updates using WebSockets
- Improved UI/UX with better styling
- Payment integration
- More advanced table management (edit/delete)
- Reservation modification history
- Statistics and reporting for admins
- User profile management

## Project Structure
```
.
├── backend/
│   ├── src/ (models, routes, middleware, server.js)
│   └── package.json
├── frontend/
│   ├── src/ (pages, components, context)
│   └── package.json
└── README.md
```

## Deployment

### Backend
- Deploy to platforms like Render, Railway, or Heroku
- Set environment variables (PORT, MONGODB_URI, JWT_SECRET)

### Frontend
- Deploy to Vercel, Netlify, or similar
- Update API_URL in frontend files to use deployed backend URL
