# Smart Campus & Resource Management System (SCRMS)
## RESTful API Documentation & Endpoint Specification

### Base URL: `http://localhost:5000/api`
All protected endpoints require an HTTP `Authorization` header formatted as:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Honour David",
  "email": "student@campus.edu",
  "password": "password123",
  "role": "student",
  "department": "Computer Science & Engineering",
  "phone": "+91 878 802 4147"
}
```
- **Responses:**
  - `201 Created`: User successfully registered with JWT token.
  - `400 Bad Request`: Email already registered or missing mandatory fields.

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "student@campus.edu",
  "password": "password123"
}
```
- **Responses:**
  - `200 OK`: Returns authenticated user profile and JWT.
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account deactivated.

### 1.3 Fetch Current Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (Any valid token)
- **Response:** `200 OK` with user profile.

---

## 2. Resource Management & Discovery Endpoints

### 2.1 List and Filter Campus Resources
- **Endpoint:** `GET /api/resources`
- **Query Parameters:**
  - `type`: Category filter (e.g., `'Computer Lab'`, `'Classroom'`)
  - `building`: Search by building name
  - `minCapacity`: Minimum seating capacity
  - `search`: Keyword search across names, equipment, and locations
  - `status`: Filter by `'Available'`, `'Under Maintenance'`, `'Deactivated'`
- **Responses:** `200 OK` with array of matching resources.

### 2.2 Get Single Resource by ID
- **Endpoint:** `GET /api/resources/:id`
- **Access:** Public / Authenticated
- **Response:** `200 OK` with resource details and upcoming reservation schedule.

### 2.3 Check Availability for Date Range
- **Endpoint:** `GET /api/resources/:id/availability`
- **Query Parameters:** `startDate`, `endDate`
- **Response:** `200 OK` with active bookings for the specified timeframe.

### 2.4 Intelligent Facility Recommendations
- **Endpoint:** `GET /api/resources/recommendations`
- **Query Parameters:** `capacity`, `equipment`, `building`, `type`, `startTime`, `endTime`
- **Response:** `200 OK` returning facilities ranked by `matchScore` ($0-100\%$) and explanation reasons.

### 2.5 Provision New Facility
- **Endpoint:** `POST /api/resources`
- **Access:** Private (`resource_manager`, `admin`)
- **Request Body:**
```json
{
  "name": "Robotics & Embedded Systems Lab",
  "type": "Computer Lab",
  "location": {
    "building": "Tech Block B",
    "floor": "2nd Floor",
    "roomNumber": "EE-204"
  },
  "capacity": 35,
  "equipment": ["Oscilloscopes", "Soldering Stations", "High-End PCs", "Air Conditioning"],
  "status": "Available",
  "approvalRequired": true,
  "description": "State of the art hardware prototyping center."
}
```
- **Responses:**
  - `201 Created`: Resource provisioned.
  - `403 Forbidden`: User role is not manager/admin.

### 2.6 Update Facility Details
- **Endpoint:** `PATCH /api/resources/:id`
- **Access:** Private (`resource_manager`, `admin`)
- **Response:** `200 OK` with updated resource document.

---

## 3. Reservation & Booking Endpoints

### 3.1 Submit Booking Request
- **Endpoint:** `POST /api/bookings`
- **Access:** Private (All authenticated roles)
- **Request Body:**
```json
{
  "resourceId": "664b38d7c81a29b001a11111",
  "startTime": "2026-10-22T09:00:00.000Z",
  "endTime": "2026-10-22T11:00:00.000Z",
  "purpose": "Full Stack Capstone Viva Examination",
  "attendeesCount": 35
}
```
- **Responses:**
  - `201 Created`: Booking created (`status: 'Approved'` if auto-policy or manager, else `'Pending'`).
  - `400 Bad Request`: End time before start time, past dates, or invalid input.
  - `409 Conflict`: Overlap detected! Response includes:
```json
{
  "success": false,
  "conflict": true,
  "message": "Booking conflict: Facility is already reserved during this time slot.",
  "conflicts": [ ... ],
  "suggestions": {
    "alternativeSlots": [ ... ],
    "alternativeRooms": [ ... ]
  }
}
```

### 3.2 List Reservations
- **Endpoint:** `GET /api/bookings`
- **Access:** Private (Students/Faculty see own bookings; Managers/Admins see all)
- **Query Parameters:** `status`, `resourceId`, `date`
- **Response:** `200 OK` with array of populated bookings.

### 3.3 Cancel Reservation
- **Endpoint:** `PATCH /api/bookings/:id/cancel`
- **Access:** Private (Booking owner, Manager, Admin)
- **Response:** `200 OK` with status updated to `Cancelled`.

### 3.4 Approval / Rejection Decision
- **Endpoint:** `PATCH /api/bookings/:id/decision`
- **Access:** Private (`resource_manager`, `admin`)
- **Request Body:**
```json
{
  "decision": "Approved",
  "reason": "Departmental laboratory session confirmed."
}
```
- **Responses:**
  - `200 OK`: Booking marked as `Approved` or `Rejected`.
  - `403 Forbidden`: Unauthorized role (e.g. student attempting to approve).
  - `409 Conflict`: Cannot approve if an overlapping reservation was approved prior.

---

## 4. Maintenance Tracking Endpoints

### 4.1 Submit Maintenance Fault Ticket
- **Endpoint:** `POST /api/maintenance`
- **Access:** Private (All roles)
- **Request Body:**
```json
{
  "resourceId": "664b38d7c81a29b001a11111",
  "description": "HDMI port on projector table is damaged.",
  "priority": "High",
  "markUnavailable": true
}
```
- **Response:** `201 Created` with populated ticket and resource updated to `Under Maintenance` if specified.

### 4.2 List Maintenance Tickets
- **Endpoint:** `GET /api/maintenance`
- **Access:** Private
- **Response:** `200 OK` with tickets list.

### 4.3 Update Ticket & Assign Technician
- **Endpoint:** `PATCH /api/maintenance/:id`
- **Access:** Private (`resource_manager`, `admin`)
- **Request Body:**
```json
{
  "status": "Resolved",
  "assignedTo": "Suresh Kumar (AV Specialist)",
  "resolutionNotes": "Replaced HDMI socket and tested with projector output.",
  "setResourceAvailable": true
}
```
- **Response:** `200 OK` with ticket resolved and facility automatically restored to `Available`.

---

## 5. Analytics & Audit Endpoints

### 5.1 Dashboard Analytics Overview
- **Endpoint:** `GET /api/analytics/overview`
- **Access:** Private (`faculty`, `resource_manager`, `admin`)
- **Response:** `200 OK` containing utilization percentage, peak booking hours distribution, facility category counts, and top 5 most booked rooms.

### 5.2 System Audit Logs
- **Endpoint:** `GET /api/audit-logs`
- **Access:** Private (`admin` only)
- **Response:** `200 OK` with chronological list of administrative actions.

---

## 6. HTTP Status Codes Reference
- `200 OK`: Request succeeded.
- `201 Created`: Resource or booking created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `403 Forbidden`: Role does not have required permissions.
- `404 Not Found`: Entity not found.
- `409 Conflict`: Scheduling collision or booking overlap.
- `500 Internal Server Error`: Unexpected server exception.
