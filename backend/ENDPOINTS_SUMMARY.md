# API Endpoints Summary - Visitor Management System

## Public Endpoints (No Authentication Required)

### Visitor Portal & Kiosk
- `GET /public/hosts` - Get all hosts
- `GET /public/hosts/department/{dept}` - Get hosts by department
- `GET /public/departments` - Get all departments
- `POST /public/appointments` - Create appointment (visitor portal)
- `POST /public/appointments/kiosk` - Create appointment (kiosk)

## Authenticated Endpoints

### Visitor Endpoints (Role: visitor)
- `GET /api/visitor/history` - Get visitor's appointment history
- `GET /api/visitor/notifications` - Get visitor notifications

### Host Endpoints (Role: host, admin)
- `GET /api/host/schedule` - Get host's schedule
- `POST /api/host/block-time` - Block time slot
- `POST /api/host/appointments/update` - Update appointment
- `GET /api/host/history` - Get host's appointment history
- `GET /api/host/notifications` - Get host notifications
- `POST /api/host/notify-receptionist` - Send message to receptionist
- `POST /api/host/receptionists` - Register a receptionist

### Receptionist Endpoints (Role: receptionist, admin)
- `GET /api/receptionist/hosts` - Get all hosts in department
- `GET /api/receptionist/hosts/{id}/schedule` - Get specific host's schedule
- `POST /api/receptionist/appointments` - Create appointment for visitor
- `PUT /api/receptionist/appointments/{id}` - Update appointment
- `GET /api/receptionist/visitors/upcoming` - Get upcoming visitors
- `GET /api/receptionist/visitors/history` - Get visitor history
- `GET /api/receptionist/notifications` - Get receptionist notifications

### Admin Endpoints (Role: admin only)

#### Hosts Management
- `GET /api/admin/hosts` - Get all hosts
- `POST /api/admin/hosts` - Register new host
- `PUT /api/admin/hosts/{id}` - Update host
- `DELETE /api/admin/hosts/{id}` - Delete host

#### Receptionists Management
- `GET /api/admin/receptionists` - Get all receptionists
- `POST /api/admin/receptionists` - Register new receptionist
- `PUT /api/admin/receptionists/{id}` - Update receptionist
- `DELETE /api/admin/receptionists/{id}` - Delete receptionist

#### Visitors & Analytics
- `GET /api/admin/visitors` - Get all visitors
- `GET /api/admin/analytics` - Get system analytics

## Role-Based Access Control

| Endpoint Pattern | Required Role(s) |
|-----------------|------------------|
| `/public/**` | None (Public) |
| `/api/visitor/**` | visitor, admin |
| `/api/host/**` | host, admin |
| `/api/receptionist/**` | receptionist, admin |
| `/api/admin/**` | admin |

## Notes for Frontend Integration

1. All authenticated endpoints require JWT Bearer token in Authorization header
2. Public endpoints do not require authentication
3. Admin role has access to all endpoints
4. Some endpoints have TODO comments for features requiring JWT token extraction
5. Analytics endpoint returns placeholder data - needs implementation
