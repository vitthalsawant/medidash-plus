# Role-Based Authentication System - Complete Guide

## Overview
Your MediDash Plus application uses a comprehensive role-based authentication system with Supabase Auth and Row-Level Security (RLS).

## Role Hierarchy

| Role | Access Level | Key Features |
|------|--------------|--------------|
| 🧑‍💼 **Super Admin** | Maximum | Full system access, can manage all users and roles |
| 👩‍💻 **Admin** | High | Manage doctors, patients, staff, appointments, verify documents |
| 🧑‍⚕️ **Doctor** | Medical | View assigned patients, create prescriptions, upload reports |
| 🧍‍♂️ **Patient** | Self-Only | View own medical history, download prescriptions/reports, book appointments |
| 👩‍⚕️ **Nurse** | Medical | Update patient vitals, assist doctors, manage patient records |
| 🧾 **Receptionist** | Front Desk | Register patients, schedule appointments, handle front-desk |

---

## Authentication Flow

### 1. User Signs Up
```typescript
// In Auth.tsx
signUp(email, password, fullName, role)
```

**What happens:**
1. ✅ Supabase creates auth user account
2. ✅ Trigger creates profile in `profiles` table
3. ✅ Role is inserted into `user_roles` table (if provided)

### 2. User Signs In
```typescript
signIn(email, password)
```

**What happens:**
1. ✅ Supabase validates credentials
2. ✅ Returns session token
3. ✅ App fetches user role from `user_roles` table
4. ✅ User redirected to dashboard based on role

### 3. Protected Routes
```tsx
<ProtectedRoute requiredRole="doctor">
  <DoctorDashboard />
</ProtectedRoute>
```

**What happens:**
1. ✅ Checks if user is authenticated
2. ✅ Checks if user has required role
3. ✅ Redirects to `/auth` if not authenticated
4. ✅ Redirects to `/dashboard` if wrong role

---

## How to Assign Roles

### Method 1: Database Direct Insert (Manual)
```sql
-- Insert role for a user
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'doctor');

-- Example roles:
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'super_admin');
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'admin');
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'doctor');
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'patient');
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'nurse');
INSERT INTO public.user_roles (user_id, role) VALUES ('uuid', 'receptionist');
```

### Method 2: During Sign Up (Patients & Doctors)
```typescript
// Patients can self-register
await signUp(email, password, fullName, 'patient')

// Doctors can self-register (pending approval)
await signUp(email, password, fullName, 'doctor')
```

### Method 3: Admin Panel (Recommended for Staff)
Create an admin interface where Super Admins can:
1. Create new users
2. Assign roles
3. Manage permissions

---

## Database Structure

### Tables Involved

#### 1. `auth.users` (Supabase Managed)
Stores authentication credentials.

#### 2. `profiles`
Stores basic user information.
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### 3. `user_roles`
Stores user roles (separate for security).
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL, -- enum: super_admin, admin, doctor, etc.
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, role)
);
```

#### 4. Role-Specific Tables
- `doctors` - Links to user_id
- `patients` - Links to user_id (optional)
- `appointments` - Links patients to doctors
- `medical_records` - Links patients to doctors
- `prescriptions` - Links patients to doctors
- `documents` - Links to patients

---

## Row-Level Security (RLS) Policies

### Key Security Features

#### 1. Users can only view their own roles
```sql
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
```

#### 2. Only Super Admins can manage roles
```sql
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin')));
```

#### 3. Medical staff can view all patients
```sql
CREATE POLICY "Medical staff can view all patients" ON public.patients
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'receptionist')
  );
```

#### 4. Patients can only view their own records
```sql
CREATE POLICY "Patients can view own record" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Helper Functions

### 1. Check if user has specific role
```typescript
const { data } = await supabase.rpc('has_role', {
  _role: 'doctor',
  _user_id: userId
});
```

### 2. Check if user is admin
```typescript
const { data } = await supabase.rpc('is_admin', {
  _user_id: userId
});
```

---

## Usage in Components

### Get current user's role
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, userRole } = useAuth();
  
  if (userRole?.role === 'doctor') {
    return <DoctorView />;
  }
  
  return <PatientView />;
}
```

### Check role for conditional rendering
```tsx
function QuickActions() {
  const { userRole } = useAuth();
  const role = userRole?.role;
  
  return (
    <div>
      {(role === 'admin' || role === 'super_admin') && (
        <Button>Manage Users</Button>
      )}
      {role === 'doctor' && (
        <Button>Create Prescription</Button>
      )}
      {role === 'patient' && (
        <Button>Book Appointment</Button>
      )}
    </div>
  );
}
```

### Create role-protected pages
```tsx
// In App.tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

---

## Testing the System

### 1. Create a Super Admin
```sql
-- First, note the user_id from auth.users table
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'super_admin');
```

### 2. Test Login
1. Go to `/auth`
2. Sign in with credentials
3. Check if redirected to `/dashboard`
4. Verify role is displayed correctly

### 3. Test Role Protection
1. Try accessing admin routes without admin role
2. Should redirect to dashboard

---

## Best Practices

✅ **DO:**
- Always use RLS policies for data access
- Check roles server-side (not just client-side)
- Assign roles through secure admin panel
- Log role changes for audit trail
- Use `requiredRole` prop for protected routes
- Validate roles in API calls

❌ **DON'T:**
- Don't trust client-side role checks alone
- Don't allow role self-assignment (except patients)
- Don't expose role management to non-admins
- Don't store sensitive data without RLS
- Don't hardcode role checks

---

## Creating Your First Super Admin

### Step 1: Create User Account
1. Go to your Supabase dashboard
2. Navigate to Authentication → Users
3. Create a new user or use existing one
4. Copy the user's UUID

### Step 2: Assign Role
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_UUID_HERE', 'super_admin');
```

### Step 3: Test Access
1. Log in with that user
2. Should see "Super Admin Dashboard"
3. Can now create other users with roles

---

## Troubleshooting

### Problem: User can't log in
**Solution:** Check if role exists in `user_roles` table

### Problem: User sees "No role assigned"
**Solution:** Insert role into `user_roles` table for that user

### Problem: User can't access certain pages
**Solution:** Check if user has required role and if route has `requiredRole` prop

### Problem: Can't insert into user_roles
**Solution:** Make sure you're authenticated as super_admin or admin

---

## Next Steps

1. ✅ Create super admin account (via SQL)
2. ✅ Build admin panel for user management
3. ✅ Add role-based UI components
4. ✅ Implement role-specific dashboards
5. ✅ Add audit logging for role changes

---

## Files Modified

1. `src/contexts/AuthContext.tsx` - Added role parameter to signUp
2. `src/pages/Auth.tsx` - Added role selector dropdown
3. `src/components/ProtectedRoute.tsx` - Role-based access control

---

## Support

For issues or questions:
- Check Supabase RLS policies
- Verify user_roles table has entries
- Use browser console to debug auth state
- Check Supabase auth logs in dashboard

