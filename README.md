# RoutineMate – Student Daily Routine Manager with Smart Notifications

RoutineMate is a full-stack, responsive web application engineered to help students organize daily schedules, track habit consistency, and receive intelligent reminders. Built with a **Spring Boot** REST backend, **MySQL 8** database, and a **React (Vite)** Tailwind CSS frontend, it includes a robust notification system powered by **Web Push API**, service workers, and automated background scheduling.

---

## 1. Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate 6 |
| **Security** | Spring Security 6, BCrypt Password Hashing, JJWT (JWT Bearer tokens) |
| **Database** | MySQL 8.0, HikariCP Connection Pool |
| **Notifications** | Web Push API (RFC 8292 VAPID), Service Worker (`sw.js`), Spring `@Scheduled` background worker, HTML5 Foreground Reminders |
| **Build & Tooling** | Maven (`mvnw`), npm, Postman |

---

## 2. Key Features

- **Authentication & Security:**
  - Secure registration, login, and logout.
  - BCrypt password hashing (never stored or transmitted in plain text).
  - JWT token-based authentication with strict student data isolation.
- **Daily Routine Management:**
  - Full CRUD: Title, description, category, start/end time, recurring rules (once, daily, weekdays), priority, reminder offset.
  - Interactive status controls: Mark routine as **Completed**, **Skipped**, or **Pending**.
  - Recurring schedule decoupling: past completion history is preserved even if routines are edited or updated.
- **Smart Notification System:**
  - Background scheduler (`@Scheduled`) evaluates due reminders and follow-up alerts every 30 seconds.
  - Follow-up alert triggers automatically if a routine is still incomplete after the configured delay.
  - **Quiet Hours:** Automatically suppresses notifications during sleep or study quiet hours.
  - **Duplicate Prevention:** Dedup event history table prevents repeat notifications.
  - **Web Push + Service Worker:** Native browser push notifications with offline service worker support and foreground browser fallback.
- **Student Dashboard:**
  - Live clock and calendar header.
  - 4 Summary stat cards: Total Today, Completed, Pending, Overdue.
  - Daily completion percentage progress bar.
  - Next upcoming routine spotlight with one-click completion.
  - Chronological schedule timeline with status badges (Green = Completed, Blue = Upcoming, Orange = Due Soon, Red = Overdue, Gray = Skipped).
  - 7-day productivity mini-chart and recent alerts feed.
- **Calendar & Schedule:**
  - Day and Week calendar views with date picker and navigation.
  - Weekday highlighting for recurring schedules.
- **Progress & Consistency Tracking:**
  - Current streak and longest streak counters (flame indicators).
  - Most consistent routine identification.
  - 7-day completion bar chart dynamically computed from MySQL completions.
- **Settings & Preferences:**
  - Profile update and BCrypt password change.
  - Reminder intervals, quiet hours, sound toggle, light/dark theme switcher.
  - "Test Notification" button for instant browser push diagnostics.

---

## 3. Project Structure

```
student_daily_routine/
├── backend/
│   ├── .mvn/wrapper/                 # Maven wrapper distribution
│   ├── mvnw / mvnw.cmd               # Maven wrapper executable
│   ├── pom.xml                       # Spring Boot dependencies & plugins
│   └── src/
│       ├── main/
│       │   ├── java/com/routinemate/
│       │   │   ├── config/           # SecurityConfig, WebConfig, CORS
│       │   │   ├── controller/       # REST API Controllers (Auth, Routine, Dashboard, Progress, etc.)
│       │   │   ├── dto/              # Request / Response DTOs
│       │   │   ├── entity/           # JPA Entities (Student, Routine, RoutineCompletion, etc.)
│       │   │   ├── exception/        # Centralized GlobalExceptionHandler
│       │   │   ├── repository/       # Spring Data JPA Repositories
│       │   │   ├── security/         # JWT Provider, AuthFilter, UserPrincipal
│       │   │   ├── service/          # Business logic & RoutineSchedulerService
│       │   │   └── RoutinemateApplication.java
│       │   └── resources/
│       │       └── application.properties # MySQL & JWT configuration
│       └── test/
├── frontend/
│   ├── public/
│   │   ├── sw.js                     # Service Worker for Web Push events
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, RoutineModal, Toast
│   │   ├── context/                  # AuthContext (JWT & Theme management)
│   │   ├── pages/                    # Dashboard, Routines, Calendar, Progress, Notifications, Settings, Auth
│   │   ├── services/                 # api.js (Fetch API client), notifications.js (Web Push)
│   │   ├── App.jsx                   # Application Root & Routing
│   │   ├── index.css                 # Tailwind CSS & custom design system
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── schema.sql                        # Complete MySQL database schema & sample seed data
├── .env.example                      # Environment configuration template
├── routinemate_postman_collection.json # Ready-to-import Postman API collection
└── README.md
```

---

## 4. Database Setup (MySQL 8)

1. Open your terminal or MySQL command-line client.
2. Log in as `root` and execute the schema:

```bash
mysql -u root -p -e "source schema.sql;"
```

Enter your password (e.g. `MySQL@12345`). This creates the database `routine_mate`, all 7 relational tables, foreign key constraints, indexes, and seeds the demo student **Alex Johnson** with sample routines.

---

## 5. Running the Application Locally

### Step 1: Start the Spring Boot Backend

From the project root:

```bash
cd backend
./mvnw.cmd spring-boot:run
```

*(On Linux / macOS, use `./mvnw spring-boot:run`)*

The backend will start on **`http://localhost:8080`**.

### Step 2: Start the React Frontend

Open a new terminal window in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 6. Demo Account Credentials

You can log in instantly by clicking the **"Use Demo Account (Alex Johnson)"** button on the login screen or by manually entering:

- **Email:** `alex@routinemate.com`
- **Password:** `password123`

You can also switch to the **Register** tab and create a brand-new student account with your own custom routines!

---

## 7. Web Push Notifications Setup

RoutineMate is configured with the standard **Web Push API (RFC 8292)** using NIST P-256 (SECP256R1) keys:

1. When you log in, navigate to **Notifications** or **Settings**.
2. Click **"Enable Browser Push"** (or click **"Test Notification"** in Settings).
3. The browser will request notification permission. Click **Allow**.
4. The service worker (`sw.js`) registers the subscription endpoint with the Spring Boot backend (`/api/push/subscribe`).
5. Scheduled background checks and the test endpoint trigger alerts to your device!
6. **Local Development Fallback:** When testing on HTTP or environments where push servers are unreachable, RoutineMate includes an automatic foreground notification and audio chime fallback so you never miss a reminder.

---

## 8. REST API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new student | No |
| `POST` | `/api/auth/login` | Authenticate & retrieve JWT | No |
| `GET` | `/api/auth/me` | Get authenticated student profile | Yes |
| `GET` | `/api/routines` | Get all routines for student | Yes |
| `GET` | `/api/routines/date/{date}` | Get routines scheduled for date | Yes |
| `POST` | `/api/routines` | Create a new routine | Yes |
| `PUT` | `/api/routines/{id}` | Update existing routine | Yes |
| `DELETE` | `/api/routines/{id}` | Delete routine | Yes |
| `PATCH` | `/api/routines/{id}/complete` | Mark routine completed | Yes |
| `PATCH` | `/api/routines/{id}/skip` | Mark routine skipped | Yes |
| `PATCH` | `/api/routines/{id}/pending` | Reset routine to pending | Yes |
| `GET` | `/api/dashboard/today` | Today's dashboard stats & timeline | Yes |
| `GET` | `/api/progress/weekly` | 7-day progress, streaks & stats | Yes |
| `GET` | `/api/notifications` | Get notification history | Yes |
| `PATCH` | `/api/notifications/{id}/read` | Mark single notification read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications read | Yes |
| `GET` | `/api/push/public-key` | Retrieve VAPID public key | No |
| `POST` | `/api/push/subscribe` | Register browser push subscription | Yes |
| `POST` | `/api/push/test` | Trigger test push alert | Yes |
| `GET` | `/api/settings` | Get student settings & preferences | Yes |
| `PUT` | `/api/settings/notifications` | Update quiet hours & alert intervals | Yes |
| `PUT` | `/api/settings/profile` | Update student profile | Yes |
| `PUT` | `/api/settings/password` | Change account password | Yes |

Import the included `routinemate_postman_collection.json` directly into Postman for ready-to-test API requests.
