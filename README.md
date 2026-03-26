# Ground Booking System

A web-based application for reserving sports grounds (cricket, football, badminton, tennis, etc.). Users can register, browse grounds, check real-time availability, book time slots, and view booking history. Admins can manage grounds, approve/cancel bookings, and view usage statistics.

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Features

- **User:** Registration, login, browse grounds, view details (location, facilities, pricing), check available slots by date, book slots, view and cancel own bookings
- **Admin:** Dashboard (stats: grounds, users, bookings, revenue), manage all bookings (confirm/cancel), list grounds, add new grounds with type, location, price, facilities

## Project Structure

```
DevOps_Project1/
├── backend/          # Express API
│   ├── config/       # DB connection
│   ├── controllers/
│   ├── middleware/   # auth, authorize
│   ├── models/       # User, Ground, Booking
│   ├── routes/
│   └── server.js
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── context/   # AuthContext
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   └── index.html
└── README.md
```

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### MongoDB local setup (Windows)

If you installed MongoDB locally on Windows, follow these steps:

1. **Start the MongoDB service**
   - Press `Win + R`, type `services.msc`, press Enter.
   - Find **MongoDB Server** in the list, right‑click → **Start** (or set Startup type to **Automatic** so it starts with Windows).
   - Or in an **Administrator** PowerShell/Command Prompt:
     ```bash
     net start MongoDB
     ```

2. **Check that MongoDB is running**
   - Open a new terminal and run:
     ```bash
     mongosh
     ```
     If it connects, you’ll see a prompt like `test>`. Type `exit` to leave.
   - Or from PowerShell:
     ```bash
     Get-Service MongoDB
     ```
     Status should be **Running**.

3. **Use the correct connection string in the backend**
   - In the backend `.env` (see Backend section below), set:
     ```env
     MONGODB_URI=mongodb://localhost:27017/ground-booking
     ```
   - The app will create the database `ground-booking` automatically when the backend starts and connects.

4. **Optional: create admin user later via MongoDB shell**
   - Run `mongosh`, then:
     ```javascript
     use ground-booking
     db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
     ```

If MongoDB was installed without as a Windows service, you can start the server manually from its install folder (e.g. `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`). The default port is **27017**.

### Backend

1. Create `.env` in `backend/` (copy from `.env.example`):

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ground-booking
   JWT_SECRET=your-secret-key-min-32-chars
   JWT_EXPIRE=7d
   ```

2. Install and run:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   Server runs at `http://localhost:5000`. API base: `http://localhost:5000/api`.

### Frontend

1. From project root:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   App runs at `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000`, so no extra env is needed for local dev.

2. (Optional) To point to another API URL:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   Then use that URL in `frontend/src/api.js` (e.g. `baseURL = import.meta.env.VITE_API_URL || '/api'`). The current setup uses relative `/api` so the proxy works.

   ### Seed dummy grounds (optional)

To populate the database with sample cricket, football, badminton, tennis, and basketball grounds:

```bash
cd backend
npm run seed
```

This clears existing grounds and inserts 10 dummy grounds. Run it once; re-running will replace grounds again.

### Create an admin user

   1. Register a user via the app (Register page).
   2. In MongoDB, set that user’s `role` to `admin`:

      ```javascript
      db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
      ```

      Replace `admin@example.com` with the email you used. Then log in again; you’ll see the Admin menu and can open the Admin dashboard.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | /api/auth/register | No  | Register |
| POST   | /api/auth/login    | No  | Login |
| GET    | /api/auth/me       | Yes | Current user |
| GET    | /api/grounds       | No  | List grounds (query: type, search) |
| GET    | /api/grounds/:id   | No  | Ground by id |
| POST   | /api/grounds       | Admin | Create ground |
| PUT    | /api/grounds/:id   | Admin | Update ground |
| DELETE | /api/grounds/:id   | Admin | Delete ground |
| GET    | /api/bookings/slots?groundId=&date= | No | Available slots |
| POST   | /api/bookings      | Yes | Create booking |
| GET    | /api/bookings/my   | Yes | My bookings |
| PUT    | /api/bookings/:id/cancel | Yes | Cancel own booking |
| GET    | /api/bookings/admin | Admin | All bookings |
| PUT    | /api/bookings/:id/status | Admin | Update status (pending/confirmed/cancelled/completed) |
| GET    | /api/admin/stats   | Admin | Dashboard stats |

## Payment (optional)

The app includes a `paymentStatus` field on bookings (`pending`, `paid`, `refunded`). Revenue in the admin dashboard is computed from bookings with `paymentStatus: 'paid'`. To add real payments, integrate a provider (e.g. Stripe/Razorpay) in the backend and update the booking flow and admin stats to set `paymentStatus` after success.

## License

MIT.
