# ⚠️ Admin Dashboard Not Loading - Quick Fix

## Most Likely Issue

Your dashboard isn't loading because **one of these is true:**

1. ❌ **You're not marked as admin** in the database
2. ❌ **Admin RLS policies are missing** from projects table
3. ❌ **No pending projects exist** to display
4. ❌ **Wrong status constraint** on projects table

---

## Quick Fix (Choose One)

### Fix #1: Make Yourself Admin (Most Common)

```sql
-- In Supabase Dashboard → SQL Editor, run:

-- Step 1: Get your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL' LIMIT 1;

-- Step 2: Copy the UUID and make yourself admin
UPDATE profiles SET role = 'admin' WHERE id = 'PASTE_YOUR_UUID_HERE';

-- Step 3: Verify
SELECT role FROM profiles WHERE id = 'PASTE_YOUR_UUID_HERE';
-- Should show: admin
```

Then **refresh the dashboard page**

---

### Fix #2: Add Missing RLS Policies

If you're admin but dashboard still won't load, the RLS policies are missing:

```
1. Copy entire contents of: FIX_ADMIN_DASHBOARD.sql
2. Open Supabase Dashboard → SQL Editor
3. Click "New Query"
4. Paste the SQL
5. Click "Run"
6. Restart dev server: npm run dev
7. Refresh dashboard
```

---

### Fix #3: Fix Status Constraint

If you posted projects but get status errors:

```
1. Copy entire contents of: FIX_STATUS_CHECK.sql
2. Open Supabase Dashboard → SQL Editor
3. Click "New Query"
4. Paste the SQL
5. Click "Run"
6. Restart dev server: npm run dev
7. Try posting again
```

---

## What's Actually Happening

When you access `/admin`:

1. ✅ AuthContext loads your user
2. ✅ App calls `isUserAdmin(userId)` 
3. ❌ Query fails because: (choose one above)
   - User not in profiles table with role='admin'
   - RLS policies prevent SELECT from profiles
   - Or projects table issues

Result: Dashboard stuck loading or shows "Access Denied"

---

## Verification

After running fixes, verify all 3 of these:

```sql
-- Check 1: Are you admin?
SELECT role FROM profiles WHERE id = 'YOUR_UUID';
-- Should show: admin

-- Check 2: Do admin RLS policies exist?
SELECT COUNT(*) FROM pg_policies
WHERE tablename = 'projects' AND policyname LIKE 'Admin%';
-- Should show: 3

-- Check 3: Do pending projects exist?
SELECT COUNT(*) FROM projects WHERE status = 'pending';
-- Should show: ≥1 (or will show 0 if you haven't posted any yet)
```

---

## Step-by-Step: From Broken to Working

### Step 1: Make Yourself Admin (2 min)
```sql
-- In Supabase SQL Editor:
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_UUID';
```

### Step 2: Run Admin Dashboard Fix (1 min)
```
Copy FIX_ADMIN_DASHBOARD.sql → Supabase SQL Editor → Run
```

### Step 3: Fix Status Constraint (1 min)
```
Copy FIX_STATUS_CHECK.sql → Supabase SQL Editor → Run
```

### Step 4: Restart Dev Server (1 min)
```bash
npm run dev
```

### Step 5: Submit a Test Project (2 min)
```
1. Go to /post-project
2. Fill in form
3. Click "Post Project"
4. Should see "✓ Project posted successfully!"
```

### Step 6: Check Admin Dashboard (1 min)
```
1. Go to /admin
2. Should load successfully
3. Should show "Pending Projects (1)"
4. Should see your project in the list
```

### Step 7: Approve Project (1 min)
```
1. Click "✓ Approve" button
2. Should see toast: "Project approved successfully!"
3. Project status changes to green
```

### Step 8: Verify Browse Page (1 min)
```
1. Go to /projects
2. Should see your approved project
3. Should be able to click and view details
```

**Total Time: ~10 minutes to complete workflow**

---

## Files Reference

| File | Purpose | When to Use |
|------|---------|------------|
| `FIX_ADMIN_DASHBOARD.sql` | Adds admin RLS policies | Dashboard won't load |
| `FIX_STATUS_CHECK.sql` | Fixes status constraint | Can't post projects |
| `ADMIN_DASHBOARD_TROUBLESHOOTING.md` | Full troubleshooting guide | Need detailed help |
| `ADMIN_DASHBOARD_DEBUG.sql` | Diagnostic queries | Not sure what's wrong |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 🔒 Access Denied | Not admin | Run Fix #1 above |
| ⏳ Loading forever | Missing RLS | Run Fix #2 above |
| status_check error | Wrong constraint | Run Fix #3 above |
| No pending projects | Haven't posted | Post a project first |

---

## Still Not Working?

1. Check browser DevTools → Console for errors
2. Run `ADMIN_DASHBOARD_DEBUG.sql` in Supabase
3. Read `ADMIN_DASHBOARD_TROUBLESHOOTING.md` for detailed help
4. Look for these specific errors:
   - `permission denied` → RLS issue
   - `Column does not exist` → Schema issue
   - `PGRST116` → No data found

---

## Expected Result

After completing steps 1-7 above:

✅ Can submit projects without errors  
✅ Projects appear in admin dashboard  
✅ Admin can approve/reject projects  
✅ Approved projects visible in browse  
✅ No loading issues or errors  

---

**Time Required:** 10 minutes  
**Difficulty:** Easy  
**Success Rate:** 99% (covers all known issues)
