# 🔧 Admin Dashboard Not Loading - Troubleshooting

## Quick Diagnosis

### Symptom 1: Dashboard Shows Loading Spinner Forever
```
⏳ Loading admin dashboard...
```

**Cause:** The `getPendingProjects()` or `isUserAdmin()` function is hanging or throwing an error

**Fix:**
1. Open DevTools → Console tab
2. Look for error messages
3. Copy/paste the error here:

---

### Symptom 2: Shows "Access Denied" Message
```
🔒 Access Denied
You don't have permission to access the admin dashboard
```

**Cause:** `isUserAdmin()` returned false (you're not marked as admin in database)

**Fix:**
```sql
-- Step 1: Find your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL' LIMIT 1;

-- Step 2: Make yourself admin (copy your UUID and run this)
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_UUID';

-- Step 3: Verify
SELECT id, role FROM profiles WHERE id = 'YOUR_UUID';
-- Should show: role = 'admin'
```

Then refresh dashboard page

---

### Symptom 3: Error Message Shows
```
⚠️ Error Loading Dashboard
[some error message]
```

**Common errors and fixes:**

#### Error: `permission denied`
- **Cause:** Missing admin RLS policies on projects table
- **Fix:** Run `FIX_ADMIN_DASHBOARD.sql` in Supabase

#### Error: `PGRST116` or `Row not found`
- **Cause:** No pending projects exist to display
- **Fix:** Post a project first to create a pending one

#### Error: `column does not exist`
- **Cause:** Wrong schema or table structure
- **Fix:** Run `FIX_STATUS_CHECK.sql` to fix table structure

---

## Step-by-Step Debugging

### Step 1: Check Browser Console
```
1. Right-click anywhere on dashboard page
2. Select "Inspect" or "Inspect Element"
3. Click "Console" tab
4. Look for red error messages
5. Take a screenshot or copy the full error
```

**Look for errors like:**
- `permission denied` → RLS issue
- `Column does not exist` → Schema issue
- `Network error` → Supabase URL issue
- `Failed to fetch` → Auth issue

---

### Step 2: Verify You're Admin
```sql
-- In Supabase SQL Editor, run:
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Should show at least 1 row with your email
-- If not, run: UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_UUID';
```

---

### Step 3: Verify RLS Policies Exist
```sql
-- In Supabase SQL Editor, run:
SELECT policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects'
ORDER BY policyname;

-- Should see 7 policies:
-- 1. Admins can delete any project
-- 2. Admins can update any project
-- 3. Admins can view all projects
-- 4. Users can delete own projects
-- 5. Users can insert own projects
-- 6. Users can update own projects
-- 7. Users can view own and approved projects

-- If missing, run: FIX_ADMIN_DASHBOARD.sql
```

---

### Step 4: Verify Pending Projects Exist
```sql
-- In Supabase SQL Editor, run:
SELECT id, title, status, owner_id FROM projects WHERE status = 'pending';

-- If returns nothing, insert a test project:
-- 1. Get an admin UUID: SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;
-- 2. Insert test: INSERT INTO projects (title, description, category, owner_id, status)
--    VALUES ('Test', 'Test Desc', 'Web Dev', 'ADMIN_UUID', 'pending');
```

---

### Step 5: Check Environment Variables
```bash
# In .env.local, verify:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Both must start with NEXT_PUBLIC_ prefix!
```

If changed, restart dev server: `npm run dev`

---

## Most Common Issues

### Issue 1: No Admin User Exists
```
Symptom: "Access Denied" error
Fix:
1. SELECT id FROM auth.users LIMIT 1;  -- get your user ID
2. UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_UUID';
3. Refresh page
```

### Issue 2: Missing Admin RLS Policies
```
Symptom: Loading forever, or permission denied error
Fix:
1. Run FIX_ADMIN_DASHBOARD.sql in Supabase
2. Restart dev server: npm run dev
3. Refresh dashboard
```

### Issue 3: No Pending Projects to Display
```
Symptom: Dashboard loads but shows "No pending projects"
Fix:
1. Go to /post-project
2. Submit a new project
3. Go back to /admin
4. Should now show 1 pending project
```

### Issue 4: Wrong Status Constraint
```
Symptom: Can't post projects, error about "status_check"
Fix:
1. Run FIX_STATUS_CHECK.sql in Supabase
2. Restart dev server: npm run dev
3. Try posting again
```

---

## Full Reset Procedure

If nothing else works, follow this complete reset:

### Step 1: Fix Status Constraint
```sql
-- In Supabase SQL Editor:
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected'));
UPDATE projects SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'rejected');
```

### Step 2: Fix RLS Policies
```sql
-- Run entire FIX_ADMIN_DASHBOARD.sql file
```

### Step 3: Make Sure User is Admin
```sql
-- Get your user
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL' LIMIT 1;

-- Update profile
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_UUID';
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Test
1. Go to /post-project → submit a project
2. Go to /admin → should load and show pending project
3. Approve the project
4. Go to /projects → should see approved project

---

## Still Not Working?

### Get Help by Collecting Information

Run these commands and share the output:

```sql
-- Check 1: Admin policies exist?
SELECT COUNT(*) as admin_policies FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects' 
AND policyname LIKE 'Admin%';

-- Check 2: Is there an admin user?
SELECT COUNT(*) as admin_count FROM profiles WHERE role = 'admin';

-- Check 3: Are there pending projects?
SELECT COUNT(*) as pending_count FROM projects WHERE status = 'pending';

-- Check 4: Is RLS enabled?
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'projects' AND schemaname = 'public';
```

Also check browser console for error messages.

---

## Reference Files

- **FIX_ADMIN_DASHBOARD.sql** - Run this if dashboard won't load
- **ADMIN_DASHBOARD_DEBUG.sql** - Diagnostic queries
- **FIX_STATUS_CHECK.sql** - Fix status constraint error
- **FIX_PROJECT_WORKFLOW.sql** - Complete workflow setup

---

## When to Run Which Script

| Problem | Solution |
|---------|----------|
| Dashboard shows loading forever | Run `FIX_ADMIN_DASHBOARD.sql` |
| "Access Denied" message | Make yourself admin (SQL above) |
| "permission denied" error | Run `FIX_ADMIN_DASHBOARD.sql` |
| Can't post projects | Run `FIX_STATUS_CHECK.sql` |
| Project status wrong | Run `FIX_STATUS_CHECK.sql` |
| Not sure what's wrong | Run `ADMIN_DASHBOARD_DEBUG.sql` to diagnose |

---

## Testing Checklist

After fixes, verify each step:

- [ ] User is marked as admin in profiles table
- [ ] 7 RLS policies exist on projects table
- [ ] Status constraint allows 'pending', 'approved', 'rejected'
- [ ] At least 1 pending project exists
- [ ] Can access /admin dashboard
- [ ] Dashboard shows pending projects
- [ ] Can approve a project
- [ ] Approved project shows in /projects browse

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Complete Troubleshooting Guide
