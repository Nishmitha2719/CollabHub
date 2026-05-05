# 🔴 CRITICAL: Admin Cannot Approve Projects - RLS Policy Missing UPDATE Permission

## Problem
After approving a project in the admin panel:
- ❌ Project doesn't appear in browse projects
- ❌ After refresh, project is back to "pending" (approval didn't save)
- ❌ Admin panel keeps asking for approval repeatedly

## Root Cause
**The RLS UPDATE policy only allows project owners to update their own projects. Admins are blocked from updating projects to approve them!**

Original policy:
```sql
CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = owner_id);
```

This means when an admin tries to update project status from "pending" to "approved", the RLS policy blocks it because:
- `auth.uid()` = admin's ID
- `owner_id` = project creator's ID
- They don't match → UPDATE blocked → Approval fails silently

## Solution
Add an additional UPDATE policy allowing admins to update ANY project:

```sql
CREATE POLICY "Admins can update any project" 
  ON projects FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

Also add DELETE policy for admins:
```sql
CREATE POLICY "Admins can delete any project" 
  ON projects FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## Implementation Steps

### 1. Go to Supabase Dashboard
- Select your project
- Navigate to **SQL Editor**

### 2. Run the Complete RLS Fix
Copy the entire SQL from `COMPLETE_RLS_FIX.sql` and execute it.

**Important**: This drops and recreates all policies to ensure a clean state.

### 3. Verify the Fix
After running, go to `Authentication` → `Policies` in Supabase and verify you see:
- ✅ "Admins can view all projects"
- ✅ "Admins can update any project"
- ✅ "Admins can delete any project"
- ✅ "Users can view own projects"
- ✅ Approved projects viewable by everyone"

### 4. Test the Approval Flow
1. Post a new project as user
2. Go to admin panel
3. Click "Approve"
4. Expected: Project immediately disappears from "Pending Projects"
5. Go to `/projects` → Should see the approved project

## Why This Happened

The initial schema only had:
- Admin SELECT policy (read-only)
- User UPDATE policy (own projects only)

But **no admin UPDATE policy** to modify project status for approval!

This is why:
- ✅ Admin could SEE pending projects (SELECT policy fixed)
- ❌ Admin couldn't APPROVE projects (UPDATE policy missing)
- ❌ Approval silently failed
- ❌ Project status never changed in database
- ❌ Approved projects never appeared in browse page

## Complete Policy Structure After Fix

| Action | Who | Can Do | Condition |
|--------|-----|--------|-----------|
| SELECT | Admins | ✅ | role = 'admin' |
| SELECT | Users | ✅ | owner_id = auth.uid() |
| SELECT | Everyone | ✅ | status = 'approved' |
| INSERT | Users | ✅ | owner_id = auth.uid() |
| UPDATE | Admins | ✅ | role = 'admin' (for approval) |
| UPDATE | Users | ✅ | owner_id = auth.uid() (own projects) |
| DELETE | Admins | ✅ | role = 'admin' |
| DELETE | Users | ✅ | owner_id = auth.uid() |

## Files
- `COMPLETE_RLS_FIX.sql` - Run this in Supabase SQL Editor

## Verification After Fix
After running the SQL and restarting your app:

```bash
npm run build
npm run dev
```

Test approval → Should work immediately ✅
