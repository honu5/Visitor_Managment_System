Visitor Management System – Full Architecture & Functional Specification
1. System Overview

A Role-Based Visitor Management System supporting:

Visitor

Kiosk

Receptionist

Host

Admin

Frontend: React + Tailwind
Backend: Spring Boot + Keycloak Authorization Server

2. Role-Based Feature Breakdown
2.1 Visitor Portal
Navigation

Appointments

Visit History

Notifications

2.1.1 Appointment Page (Main)

Features:

List of all departments

List of hosts in selected department

Clicking a host → Open appointment form

Appointment Form Fields:

Full Name

Email

Phone

Purpose of Visit

Preferred Date

Preferred Time

Backend Endpoints:

GET /public/hosts
GET /public/hosts/department/{dept}
POST /public/appointments

2.1.2 Visit History

Shows visitor’s past visits.

Backend Endpoint:

GET /api/visitor/history

2.1.3 Notifications

List of notifications (appointment approved, declined, updated).

Backend Endpoint:

GET /api/visitor/notifications

2.2 Kiosk Interface
Single-Screen Process

Select department

Select host in that department

Fill a simple appointment form

Submit → Host + Receptionist get notification

Backend Endpoints:

GET /public/departments
GET /public/hosts/department/{dept}
POST /public/appointments/kiosk

2.3 Host Portal
Navigation

Schedule (Main)

History

Notifications

Contact Receptionist

2.3.1 Host Schedule Page

Features:

Grid showing next 7 days

List of appointments per day

Host can mark time slots as unavailable

Host can accept/cancel/modify appointments

Backend:

GET /api/host/schedule
POST /api/host/block-time
POST /api/host/appointments/update

2.3.2 Host Visit History
GET /api/host/history

2.3.3 Host Notifications
GET /api/host/notifications

2.3.4 Contact Receptionist

Host → Receptionist messaging (one-way alert).

POST /api/host/notify-receptionist

2.4 Receptionist Portal
Navigation

Department Hosts (Dashboard)

Visitors (History + Incoming)

Notifications

2.4.1 Department Hosts Dashboard (Main)

Receptionist sees hosts only in her department.

Features:

List hosts

Click on host → View schedule

Make/changing appointments on behalf of visitor

Backend:

GET /api/receptionist/hosts
GET /api/receptionist/hosts/{id}/schedule
POST /api/receptionist/appointments
PUT /api/receptionist/appointments/{id}

2.4.2 Visitors Section

Split into:

Incoming Visitors
GET /api/receptionist/visitors/upcoming

History Log
GET /api/receptionist/visitors/history

2.4.3 Notifications

Sent when host delays or cancels an appointment.

GET /api/receptionist/notifications

2.5 Admin Portal

Admin manages the entire system.

Navigation

Hosts Management

Receptionists Management

Visitors

Analytics

2.5.1 Hosts Management
GET /api/admin/hosts
POST /api/admin/hosts
PUT /api/admin/hosts/{id}
DELETE /api/admin/hosts/{id}

2.5.2 Receptionists Management
GET /api/admin/receptionists
POST /api/admin/receptionists
PUT /api/admin/receptionists/{id}
DELETE /api/admin/receptionists/{id}

2.5.3 Registered Visitors
GET /api/admin/visitors

2.5.4 Analytics Dashboard

Daily visitors

Host busy rate

Department load

Peak times

GET /api/admin/analytics

3. Frontend Architecture (React)
frontend/
 ├── src/
 │   ├── api/
 │   │   ├── visitorApi.js
 │   │   ├── kioskApi.js
 │   │   ├── hostApi.js
 │   │   ├── receptionistApi.js
 │   │   ├── adminApi.js
 │   ├── components/
 │   │   ├── Navbar/
 │   │   ├── Sidebar/
 │   │   ├── Card/
 │   │   ├── Tables/
 │   │   ├── Forms/
 │   ├── pages/
 │   │   ├── Visitor/
 │   │   │   ├── Appointments.jsx
 │   │   │   ├── History.jsx
 │   │   │   ├── Notifications.jsx
 │   │   ├── Kiosk/
 │   │   │   ├── KioskHome.jsx
 │   │   ├── Host/
 │   │   │   ├── Schedule.jsx
 │   │   │   ├── History.jsx
 │   │   │   ├── Notifications.jsx
 │   │   │   ├── ContactReceptionist.jsx
 │   │   ├── Receptionist/
 │   │   │   ├── HostsDashboard.jsx
 │   │   │   ├── Visitors.jsx
 │   │   │   ├── Notifications.jsx
 │   │   ├── Admin/
 │   │   │   ├── Hosts.jsx
 │   │   │   ├── Receptionists.jsx
 │   │   │   ├── Visitors.jsx
 │   │   │   ├── Analytics.jsx
 │   ├── utils/
 │   ├── App.jsx
 │   ├── main.jsx
 ├── public/
 ├── package.json

4. Backend Architecture
backend/
 ├── src/main/java/com/vms/
 │   ├── controller/
 │   │   ├── VisitorController.java
 │   │   ├── KioskController.java
 │   │   ├── HostController.java
 │   │   ├── ReceptionistController.java
 │   │   ├── AdminController.java
 │   ├── service/
 │   ├── repository/
 │   ├── model/
 │   ├── security/
 │   ├── dto/
 │   └── VisitorManagementApplication.java
 ├── pom.xml
