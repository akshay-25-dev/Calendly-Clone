# Calendly Clone

A full-featured scheduling and booking web application that replicates Calendly's design and user experience. Users can create event types, set their availability, and let others book time slots through a public booking page.

## 📸 Features

### Core
- **Event Types Management** — Create, edit, delete event types with name, duration, URL slug, color, description, and location
- **Availability Settings** — Set available days (with toggle), time slots per day, and timezone
- **Public Booking Page** — Month calendar view, available time slots, booking form with name, email, and optional notes
- **Double Booking Prevention** — Server-side validation prevents booking the same slot twice
- **Booking Confirmation** — Animated confirmation page with full meeting details
- **Meetings Dashboard** — View upcoming/past/cancelled meetings with event details and cancel functionality

### Bonus
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Date-Specific Overrides** — Override availability for specific dates (custom hours or block entirely)
- **Custom Invitee Questions** — Optional notes/questions field on booking form
- **Premium Calendly UI** — Pixel-perfect design matching Calendly's design language

## 🛠 Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React.js 19 (Create React App) |
| Styling    | Vanilla CSS (custom design system) |
| Backend    | Node.js + Express.js 5        |
| Database   | MySQL + Sequelize ORM          |
| HTTP Client| Axios                          |
| Calendar   | react-calendar                 |

## 📊 Database Schema

```
┌──────────────────┐    ┌──────────────────────┐
│   EventTypes     │    │     Bookings         │
├──────────────────┤    ├──────────────────────┤
│ id (PK)          │───<│ id (PK)              │
│ name             │    │ EventTypeId (FK)     │
│ duration         │    │ name                 │
│ slug (UNIQUE)    │    │ email                │
│ color            │    │ date                 │
│ description      │    │ time                 │
│ location         │    │ status               │
│ is_active        │    │ notes                │
│ createdAt        │    │ createdAt            │
│ updatedAt        │    │ updatedAt            │
└──────────────────┘    └──────────────────────┘

┌──────────────────┐    ┌──────────────────────┐
│  Availabilities  │    │   DateOverrides      │
├──────────────────┤    ├──────────────────────┤
│ id (PK)          │    │ id (PK)              │
│ day_of_week      │    │ date (UNIQUE)        │
│ start_time       │    │ start_time           │
│ end_time         │    │ end_time             │
│ timezone         │    │ is_blocked           │
│ is_available     │    │ createdAt            │
│ createdAt        │    │ updatedAt            │
│ updatedAt        │    └──────────────────────┘
└──────────────────┘
```

### Relationships
- `EventType` → has many → `Booking` (one-to-many, cascading delete)
- `Availability` is global (shared across all events, like Calendly)
- `DateOverride` overrides the regular weekly schedule for a specific date

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MySQL server running locally
- Git

### 1. Database Setup
```bash
# Login to MySQL and create the database
mysql -u root -p
CREATE DATABASE calendly_clone;
EXIT;
```

### 2. Backend Setup
```bash
cd calendly-backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MySQL credentials:
#   PORT=5000
#   DB_NAME=calendly_clone
#   DB_USER=root
#   DB_PASS=yourpassword
#   DB_HOST=localhost

# Seed the database with sample data
node seed.js

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd calendly-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`.

## 📁 Project Structure

```
Calendly-clone/
├── calendly-backend/
│   ├── config/
│   │   └── db.js              # Sequelize MySQL connection
│   ├── controllers/
│   │   ├── eventController.js     # Event CRUD operations
│   │   ├── availabilityController.js  # Availability + overrides
│   │   ├── bookingController.js   # Slots + booking + reschedule
│   │   └── meetingController.js   # Meetings + cancellation
│   ├── models/
│   │   ├── EventType.js       # Event type model
│   │   ├── Availability.js    # Weekly availability model
│   │   ├── Booking.js         # Booking model
│   │   ├── DateOverride.js    # Date-specific override model
│   │   └── index.js           # Model associations
│   ├── routes/
│   │   ├── eventRoutes.js
│   │   ├── availabilityRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── meetingRoutes.js
│   ├── utils/
│   │   └── slotGenerator.js   # Dynamic time slot generation
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── seed.js                # Database seeding script
│   └── .env                   # Environment variables
│
├── calendly-frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx        # Navigation sidebar
│       │   ├── Layout.jsx         # Admin layout wrapper
│       │   ├── Modal.jsx          # Reusable modal
│       │   ├── Toast.jsx          # Toast notifications
│       │   └── ConfirmDialog.jsx  # Confirmation dialogs
│       ├── pages/
│       │   ├── Dashboard.jsx      # Event types management
│       │   ├── AvailabilityPage.jsx # Availability settings
│       │   ├── BookingPage.jsx    # Public booking page
│       │   ├── Confirmation.jsx   # Booking confirmation
│       │   └── Meetings.jsx       # Meetings management
│       ├── services/
│       │   └── api.js             # API client
│       ├── App.jsx                # Router configuration
│       └── index.css              # Complete design system
│
└── README.md
```

## 📡 API Endpoints

### Events
| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| GET    | /events             | List all events       |
| POST   | /events             | Create event          |
| GET    | /events/:id         | Get event by ID       |
| GET    | /events/slug/:slug  | Get event by slug     |
| PUT    | /events/:id         | Update event          |
| DELETE | /events/:id         | Delete event          |

### Availability
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /availability             | Get weekly schedule      |
| POST   | /availability             | Set weekly schedule      |
| GET    | /availability/overrides   | Get date overrides       |
| POST   | /availability/override    | Create date override     |
| DELETE | /availability/override/:id| Delete date override     |

### Booking
| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | /booking/slots/:slug?date= | Get available slots      |
| GET    | /booking/event/:slug       | Get event for booking    |
| POST   | /booking                   | Create booking           |
| PATCH  | /booking/:id/reschedule    | Reschedule booking       |

### Meetings
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | /meetings             | List all meetings     |
| GET    | /meetings/:id         | Get meeting details   |
| PATCH  | /meetings/:id/cancel  | Cancel meeting        |

## 🏗 Key Design Decisions

1. **No Authentication** — A default admin user is assumed for the admin side (Event Types, Availability, Meetings). The public booking page is accessible without login.

2. **Global Availability** — Availability is set globally (not per event type), matching Calendly's actual behavior where your calendar availability applies to all event types.

3. **Dynamic Slot Generation** — Time slots are generated dynamically from availability settings and event duration, not stored in the database. Each date's slots are computed on-the-fly.

4. **Double Booking Prevention** — Enforced at the database query level. Only "booked" (non-cancelled) bookings are checked for conflicts.

5. **Vanilla CSS Design System** — A custom CSS design system using CSS custom properties mirrors Calendly's exact design language without external CSS frameworks.

6. **Date Overrides** — Specific dates can have custom hours or be completely blocked, taking priority over regular weekly availability.

## 📌 Assumptions

- MySQL is running locally on the default port (3306)
- The backend runs on port 5000, frontend on port 3000
- All times are stored in 24-hour format (HH:MM)
- The default timezone is Asia/Kolkata (configurable)
- No email notifications are sent (UI simulates confirmation)
- The seed script uses `force: true` which drops and recreates tables