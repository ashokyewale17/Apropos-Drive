# Attendance Edit Request Feature

## Overview
This feature allows employees to request changes to their attendance timing (check-in/check-out times) with an approval workflow managed by administrators.

## Components

### 1. Backend
- **Model**: `AttendanceEditRequest` - Stores edit requests with approval workflow
- **Routes**: `/api/attendance-edit` - Handles CRUD operations for edit requests
- **Fields**:
  - employeeId (reference to Employee)
  - attendanceId (reference to Attendance record)
  - date (date of attendance)
  - originalInTime / originalOutTime (original timing)
  - requestedInTime / requestedOutTime (requested changes)
  - reason (reason for edit)
  - status (pending/approved/rejected)
  - requestedAt / reviewedAt (timestamps)
  - reviewedBy (admin who reviewed)

### 2. Frontend

#### Employee Interface
- **Page**: `EmployeeAttendance.jsx`
- Features:
  - Edit button on past attendance records
  - Form to submit timing changes with reason
  - Pending requests banner
  - Success notifications

#### Admin Interface
- **Page**: `AttendanceEditRequests.jsx`
- Features:
  - List of all edit requests (pending/approved/rejected)
  - Filter by status
  - Search functionality
  - Approval/rejection workflow
  - Visual comparison of original vs requested timing

### 3. Notification System
- Real-time notifications for:
  - Request submission
  - Approval/rejection status
- Persistent notifications in header

## Workflow

1. **Employee submits request**:
   - Navigate to Attendance page
   - Click "Edit Timing" on a past attendance record
   - Enter new timing and reason
   - Submit request

2. **Admin reviews request**:
   - View pending requests in Admin Dashboard or Edit Requests page
   - Review original vs requested timing
   - Approve or reject with reason

3. **System updates**:
   - If approved: Attendance record is updated
   - If rejected: Employee notified with reason
   - Both parties receive notifications

## API Endpoints

### Employee Routes
- `POST /api/attendance-edit/edit-request` - Submit edit request
- `GET /api/attendance-edit/edit-requests/employee` - Get employee's requests

### Admin Routes
- `GET /api/attendance-edit/edit-requests/pending` - Get pending requests
- `PUT /api/attendance-edit/edit-request/:id/:action` - Approve/reject request

## Implementation Notes

- All changes are stored in the database with full audit trail
- Employees can only edit their own past attendance records
- Only one pending request per attendance record is allowed
- Notifications persist until manually cleared
- UI designed for both desktop and mobile responsiveness

## Future Enhancements

- Email notifications
- Bulk approval functionality
- Request escalation workflow
- Detailed reporting and analytics
- Integration with existing leave management system