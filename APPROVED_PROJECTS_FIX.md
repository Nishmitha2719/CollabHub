# 🔍 Fix: Approved Projects Not Visible in Browse

## Problem

Projects approved by admin are **not showing** on the `/projects` browse page for other users.

**Symptoms:**
- ✗ Admin dashboard shows pending projects
- ✓ Admin approves a project (shows success)
- ✗ Browse page still shows "No approved projects found"
- ✗ Other users cannot see the approved project

---

## Root Causes (Fixed)

### Issue 1: Broken Query (FIXED ✅)
The `getProjects()` function used FK join syntax that doesn't work:
```typescript
// ❌ BROKEN:
.select(`*, project_skills (skill_id, skills (name))`)
```

**Fix Applied:** Rewrote to fetch projects separately, then skills

### Issue 2: Missing Public RLS Policy (FIXED ✅)
The RLS policies didn't allow **unauthenticated users** to see approved projects.

**Fix Applied:** Added public policy `"Anyone can view approved projects"`

---

## What Changed

### Code Changes
**File:** `lib/api/projects.ts`

1. ✅ `getProjects()` - Rewritten, no FK joins
2. ✅ `getProjectById()` - Rewritten, no FK joins

### Database Changes
**File:** `FIX_APPROVED_PROJECTS_VISIBILITY.sql` (must run)

- Drop all old policies
- Add 8 new policies in correct order:
  - 3 admin policies (view/update/delete all)
  - 1 **public policy** (anyone sees approved)
  - 4 user policies (own + approved)

---

## Deploy the Fix

### Step 1: Run SQL (Required!)
```
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents: FIX_APPROVED_PROJECTS_VISIBILITY.sql
3. Paste into SQL Editor
4. Click "Run"
5. Wait for success message
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Test
```
1. Admin dashboard: Post a new project
2. Admin: Approve the project
3. New browser tab or incognito window
4. Navigate to /projects
5. Should see the approved project!
```

---

## RLS Policy Structure (After Fix)

| Policy | Applies To | Condition |
|--------|-----------|-----------|
| **Admin view all** | Admins | SELECT - sees all statuses |
| Admin update any | Admins | UPDATE - can change status |
| Admin delete any | Admins | DELETE - can remove |
| **Anyone approved** | Everyone | SELECT - sees approved only |
| User view own/approved | Logged in | SELECT - sees own + approved |
| User insert | Logged in | INSERT - can create |
| User update own | Logged in | UPDATE - own only |
| User delete own | Logged in | DELETE - own only |

**Key:** "Anyone approved" policy allows unauthenticated users to browse

---

## Expected Result After Deployment

✅ Approved projects visible on `/projects` for everyone  
✅ Unauthenticated users can browse  
✅ Users can see projects to join  
✅ Admin dashboard still works  
✅ Users still see only their own + approved  

---

## Troubleshooting

### Still No Approved Projects Showing

1. **Verify approved projects exist:**
   ```sql
   SELECT COUNT(*) FROM projects WHERE status = 'approved';
   ```
   If 0, go post and approve a project first

2. **Verify RLS policies applied:**
   ```sql
   SELECT policyname FROM pg_policies
   WHERE tablename = 'projects' AND policyname LIKE '%approved%';
   ```
   Should show: "Anyone can view approved projects"

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Clear cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito window

### RLS Policy Error in Browser Console

If you see "permission denied" error:

1. Check if "Anyone can view approved projects" policy exists (above)
2. Run the SQL script again
3. Restart dev server

### Approved Projects Show for Me But Not Others

This means RLS is working but the "public" policy might not be active.

1. Verify policy exists (check above)
2. Have your friend open in **incognito/private** window
3. Or have them open in **different browser**

---

## Timeline

1. ✅ Identified FK join as breaking query
2. ✅ Rewritten `getProjects()` and `getProjectById()`
3. ✅ Created comprehensive RLS policy fix
4. ✅ Added public visibility policy

**Next:** Run SQL script, restart server, test

---

## Files Created

- `FIX_APPROVED_PROJECTS_VISIBILITY.sql` - **RUN THIS in Supabase**
- `APPROVED_PROJECTS_FIX.md` - This file

---

## Quick Checklist

After deployment:

- [ ] Run `FIX_APPROVED_PROJECTS_VISIBILITY.sql` in Supabase
- [ ] Restart dev server: `npm run dev`
- [ ] Post a test project as admin
- [ ] Approve it
- [ ] Open `/projects` - should see approved project
- [ ] Test in incognito/private window - should see it
- [ ] Test as different user - should see it

---

**Status:** ✅ Code Fixed, SQL Ready, Ready to Deploy
