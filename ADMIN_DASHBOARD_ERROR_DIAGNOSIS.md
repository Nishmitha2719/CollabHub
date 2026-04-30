# How to See the Actual Error

The "Failed to load projects" message is generic. The real error is in your browser console.

## Step 1: Open Browser Console

**On Windows/Mac:**
- Press: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- OR Right-click → "Inspect" or "Inspect Element"

**On browser:**
- Click the "Console" tab

## Step 2: Look for Red Errors

You should see console logs like:

```
Fetching pending projects with limit: 200
```

Or error logs like:

```
Error fetching pending projects: {
  message: "...",
  code: "...",
  details: "..."
}
```

## Step 3: Find the Actual Error Message

Look for one of these patterns:

### Pattern 1: Foreign Key Error
```
Error: PGRST900 ... relation "projects_owner_id_fkey" not found
```
**Solution:** Already fixed in code update ✅

### Pattern 2: Permission Error
```
Error: PGRST100 ... permission denied for relation projects
```
**Solution:** Run `FIX_ADMIN_DASHBOARD.sql`

### Pattern 3: Column Error
```
Error: PGRST042703 ... column "owner_id" does not exist
```
**Solution:** Check projects table schema in Supabase

### Pattern 4: Table Error
```
Error: ... relation "project_skills" not found
```
**Solution:** This is OK - code handles missing tables

### Pattern 5: RLS Policy Error
```
Error: PGRST100 ... RLS policy issue
```
**Solution:** Verify admin policies exist

## Step 4: Copy the Error

1. Right-click on the error in console
2. Select "Copy" or "Copy Message"
3. Share with me or look it up in the solutions above

---

## Quick Test After Code Update

1. Restart dev server: `npm run dev`
2. Go to /admin
3. Open DevTools Console (F12)
4. Should see: `Fetching pending projects with limit: 200`
5. Then either:
   - `Found 0 pending projects` (good - dashboard works, just no projects)
   - `Found 5 pending projects` (good - dashboard loaded)
   - Error message (dashboard failed)

---

## If You Still See "Failed to load projects"

1. Check console for red errors
2. Look for the error pattern above
3. Run corresponding SQL fix if needed
4. Restart dev server
5. Try again

The code is now more robust and should handle most issues gracefully!
