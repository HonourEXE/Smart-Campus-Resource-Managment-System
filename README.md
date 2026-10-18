# Smart Campus and Resource Management System (SCRMS)
### Real-Time Facility Availability, Intelligent Conflict Prevention & Equipment Maintenance Tracking

**Course:** Full Stack Development (Course Code: 23DC2032 | Semester V)  
**Evaluation:** Rubrics for Skill Based Evaluation (IA III) — Capstone Project (30 Marks)  
**Target:** Excellent Category (5/5) across Front-end Design, Back-end Integration, Functionality, Presentation, Innovation, and Documentation.

---

## 🏛️ Project Overview

The **Smart Campus and Resource Management System (SCRMS)** is a centralized, role-aware full-stack web application that streamlines how colleges and universities discover, reserve, and maintain classrooms, high-performance computing laboratories, seminar halls, audiovisual kits, and sports facilities.

### 🌟 Key Innovations
1. **Mathematical Conflict Detection:** Enforces `existing.startTime < requested.endTime && existing.endTime > requested.startTime`. Rejects overlaps with **HTTP 409 Conflict** and automatically suggests non-conflicting time slots and alternative facilities.
2. **Intelligent Room Recommendations:** Rule-based algorithm ranking available rooms by capacity fit ratio, equipment matching, and location proximity.
3. **Automated Notification Dispatcher:** In-app event alerts for approvals, rejections, reminders, and repair milestones.
4. **Maintenance Lifecycle Workflow:** Report damaged hardware $\rightarrow$ assign technician $\rightarrow$ auto-set facility to *Under Maintenance* $\rightarrow$ resolve issue $\rightarrow$ auto-restore to *Available*.
5. **Zero-Configuration Execution:** Connects directly to MongoDB (`process.env.MONGODB_URI`) with an embedded in-memory fallback. Auto-seeds complete demo data on first launch!

---

## 🛠️ Technology Stack (MERN Architecture)

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Modular, high-performance Single Page Application |
| **Styling** | Bootstrap 5 + Custom CSS | Glassmorphism, HSL color tokens, micro-animations, responsive cards |
| **Routing** | React Router v6 | Role-based protected routes (`ProtectedRoute`) |
| **Backend** | Node.js v24 + Express.js | Robust RESTful API endpoints and business logic |
| **Database** | MongoDB + Mongoose 8 | Schema-validated collections with compound indexes |
| **Security** | JWT + BCrypt.js | Stateless authentication and salted password hashing |
| **Charts** | Chart.js + React-Chartjs-2 | Visual utilization rates and peak booking hours histograms |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ or v24 LTS recommended)
- **npm** (v9+)
- Local MongoDB running on port 27017, OR MongoDB Atlas URI in `server/.env`. *(If no external MongoDB is running, the server automatically boots an in-memory database!)*

### Installation

Clone the repository and install dependencies:
```bash
# Install root, server, and client dependencies in one command
npm run install-all
```

### Running Locally

To run both backend API and React frontend concurrently:

1. **Start Express Backend (Port 5000):**
```bash
npm run start:server
```

2. **Start Vite React Frontend (Port 3000):**
```bash
npm run start:client
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Demo Credentials (1-Click Evaluation Bar)

The application includes a **Top Demo Switcher Bar** that enables **1-click instant login** as any of the 4 roles:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Student** | `student@campus.edu` | `password123` | Search venues, submit booking requests, view my reservations, report faults |
| **Faculty** | `faculty@campus.edu` | `password123` | Reserve halls, check equipment, view department analytics, report faults |
| **Resource Manager** | `manager@campus.edu` | `password123` | Approve/reject booking queue, manage facilities, assign technicians, track repairs |
| **Administrator** | `admin@campus.edu` | `password123` | Full access, user management, RBAC role promotion, system-wide analytics, audit logs |

---

## 📋 Evaluation Demonstration Plan (Viva Sequence)

Follow these steps to demonstrate the full application during viva/evaluation:

1. **Step 1 (Student Login & Search):**
   - Click **"Student"** on the top demo bar or log in with `student@campus.edu`.
   - Go to **"Discover & Book"** (`/resources`). Filter by "Computer Lab" or test the **Smart AI/Rule Recommendation** wizard.
2. **Step 2 (Book Facility):**
   - Select an available room (e.g. *Ramanujan Lecture Theatre* or *Edison Robotics Lab*).
   - Enter purpose: *"Full Stack Project Review"*, and click **"Confirm Reservation"**.
3. **Step 3 (Demonstrate Conflict Detection):**
   - Attempt to book *Turing Advanced Computing Lab (CS-301)* for tomorrow **10:00 AM - 12:00 PM** (already reserved).
   - The backend returns **HTTP 409 Conflict**. The UI launches the **Smart Conflict Resolution Modal** displaying alternative open slots and alternative rooms!
4. **Step 4 (Manager Approval):**
   - Click **"Resource Manager"** on the demo bar.
   - Go to **"Approvals & Bookings"** (`/bookings`). Filter for **Pending** requests.
   - Click **"Approve"**, enter approval notes, and confirm.
5. **Step 5 (Report Fault & Repair Lifecycle):**
   - Go to **"Maintenance"** (`/maintenance`). Click **"Report Fault / Damage"**.
   - Select *4K Projector Kit*, set priority to *Urgent*, check *"Mark as Under Maintenance"*, and submit.
   - Click **"Manage"** on the ticket, assign *Suresh Kumar*, and change status to **Resolved**. The facility is automatically restored to **Available**!
6. **Step 6 (Admin Analytics & Audit Trail):**
   - Click **"Admin"** on the demo bar.
   - Open **"Analytics"** (`/analytics`) to view utilization rates, peak hours histogram, and facility category distribution.
   - Open **"Admin & Audit"** (`/admin/users`) to review user role assignments and chronological audit logs.

---

## 📁 Project Directory Structure

```
smart-campus/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, DemoSwitcher, ConflictModal, ProtectedRoute
│   │   ├── context/          # AuthContext with 1-click role switcher & notifications
│   │   ├── pages/            # Login, Register, Dashboard, Resources, Bookings, Maintenance, etc.
│   │   ├── services/         # Axios API service layer with JWT interceptor
│   │   ├── App.jsx           # Client router and RBAC guards
│   │   ├── index.css         # Glassmorphism & custom design system
│   │   └── main.jsx          # React DOM entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── config/               # db.js (MongoDB & MongoMemoryServer connector)
│   ├── controllers/          # auth, resource, booking, maintenance, analytics, notification
│   ├── middleware/           # auth.js (JWT), role.js (RBAC), auditLogger.js
│   ├── models/               # User, Resource, Booking, MaintenanceTicket, Notification, AuditLog
│   ├── routes/               # RESTful API route definitions
│   ├── seed/                 # seedData.js (realistic campus demo dataset)
│   ├── services/             # conflictService.js & recommendationService.js
│   ├── tests/                # api.test.js (Automated regression suite)
│   ├── app.js                # Express pipeline configuration
│   ├── server.js             # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── system-architecture.md# Full architecture design, Mermaid diagrams & specs
│   ├── api-documentation.md  # Detailed REST endpoints, payloads, status codes
│   └── test-cases.md         # Viva demonstration protocol & test suite matrix
├── .gitignore
└── README.md
```

---

## 🧪 Automated Backend Tests

Run the built-in REST API validation test suite:
```bash
npm run test:server
```
Tests pass **100%** covering health checks, auth, conflict detection, RBAC 403 Forbidden validation, manager approvals, recommendations, and analytics.
