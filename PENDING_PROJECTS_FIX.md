# Fix: Pending Projects Not Showing in Admin Panel

## Problem
Projects posted by users are showing as "pending" in the database but are not visible in the admin panel for approval.

## Root Cause
The issue is in the **Row-Level Security (RLS) policies** on the `projects` table in Supabase.

The original policy was:
```sql
CREATE POLICY "Approved projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (status = 'approved' OR owner_id = auth.uid());
```

This policy only allows users to see:
- **Approved** projects (public)
- Projects they **own** (including their own pending projects)

**There was NO policy allowing admins to view pending projects from other users.**

## Solution
Add an RLS policy that specifically allows admins to view ALL projects (pending, approved, rejected):

```sql
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## Implementation Steps

1. **Go to Supabase Dashboard** → Select your project
2. **Navigate to SQL Editor**
3. **Copy and paste the SQL from `FIX_PENDING_PROJECTS_RLS.sql`**
4. **Execute the SQL**
5. **Refresh your admin panel** in the browser

## Verification
After applying the fix:
1. Go to `/admin` (Admin Dashboard)
2. You should now see "Pending Projects" section with projects showing as pending
3. You can approve/reject/delete them

## Technical Details
The fix creates multiple SELECT policies:
- **Admin policy**: Admins can see all projects
- **Public policy**: Everyone can see approved projects
- **Owner policy**: Users can see their own projects

This provides proper role-based access control while maintaining security.
