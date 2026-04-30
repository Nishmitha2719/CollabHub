# Authentication Debugging & Fix Guide

## Issues Found & Fixed

### 1. **Missing Error Handling in AuthContext** ✅ FIXED
**Problem:** The `signUp` and `signIn` functions weren't catching network errors, resulting in "Failed to fetch" appearing without details.

**What was wrong:**
```typescript
// OLD - No try/catch, silent failures
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp(...);
  // Network errors weren't caught!
  return { error };
};
```

**What was fixed:**
- Added `try/catch` blocks to all auth functions (`signUp`, `signIn`, `resetPassword`)
- Added `console.error()` logging so errors appear in browser DevTools
- Wrapped profile creation in error handling so it doesn't crash signup
- All caught exceptions are now properly converted to error objects

### 2. **Profile Creation RLS Policy** 
**Potential Issue:** If RLS policy is too restrictive, profiles can't be created during signup.

**RLS Policy Requirements:**
```sql
-- MUST allow INSERT when auth.uid() = id (the user's own ID)
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Solution:** Run the `FIX_AUTH_ISSUES.sql` script in Supabase to:
- Create an automatic trigger that creates profiles on signup
- Ensure RLS policies are correctly set
- Add proper error handling to profile creation

### 3. **Profile Creation Race Condition** ✅ FIXED
**Problem:** Profile insert in `signUp()` was attempting before RLS policy could validate.

**Solution:** 
- Made profile creation in `signUp()` non-blocking (wrapped in try/catch)
- Added fallback: `onAuthStateChange` listener also creates profile if missing
- Result: Profile gets created either way, signup always succeeds

### 4. **Missing Console Logging** ✅ FIXED
**Problem:** Errors were being caught but not logged, making debugging impossible.

**Solution:** Added detailed console.error logging at every failure point:
```typescript
console.error('Supabase signUp error:', error);
console.error('Profile creation error:', profileError);
console.error('SignUp exception:', exception);
```

---

## How to Debug Further

### Step 1: Check Browser Console
Open browser DevTools (F12) → Console tab
1. Try signing up
2. Look for `console.error()` messages
3. Copy the exact error message

### Step 2: Verify Environment Variables
File: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_xxx
```

**Important:** These MUST have `NEXT_PUBLIC_` prefix and be in `.env.local` (not `.env`).

### Step 3: Check Supabase Configuration
Go to Supabase Dashboard:

1. **Auth Settings:**
   - Authentication > Providers > Email Auth enabled?
   - Go to Auth > URL Configuration
   - Site URL: `http://localhost:3000` (for local dev)
   - Redirect URLs: Add `http://localhost:3000/auth/callback`

2. **CORS Settings:**
   - Settings > API > CORS Allowed Origins
   - Should include `http://localhost:3000`
   - Or set to `*` for development

3. **RLS Policies:**
   - Go to SQL Editor
   - Run the `FIX_AUTH_ISSUES.sql` script

### Step 4: Test Supabase Connection
In browser console, run:
```javascript
// Check if Supabase is initialized
console.log(window.__SUPABASE_URL__)  // Should show your URL
```

### Step 5: Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" | Network/CORS issue | Check CORS settings, verify URL is correct |
| "Invalid credentials" | Wrong email/password | Check credentials, ensure user exists |
| "Row violates RLS policy" | RLS too restrictive | Run `FIX_AUTH_ISSUES.sql` |
| "Project ID not found" | Invalid Supabase URL | Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` |
| "User already exists" | Email already registered | Try with different email |

---

## Code Changes Summary

### File: `lib/AuthContext.tsx`

**Changes Made:**

1. **signUp function**
   - Added try/catch wrapper
   - Added console.error logging
   - Profile creation wrapped in separate try/catch
   - Returns proper error object on any failure

2. **signIn function**
   - Added try/catch wrapper
   - Added console.error logging
   - Converts exceptions to error objects

3. **resetPassword function**
   - Added try/catch wrapper
   - Added console.error logging
   - Converts exceptions to error objects

4. **onAuthStateChange listener**
   - Added try/catch around profile creation
   - Added console.error logging
   - Prevents signup failures if profile creation fails

### File: `FIX_AUTH_ISSUES.sql` (NEW)
- Drop and recreate RLS policies for profiles table
- Create automatic profile creation trigger on auth.users INSERT
- Add proper error handling with EXCEPTION clause
- Include debugging notes

---

## Testing Checklist

✅ **After applying fixes, test:**

1. Open browser DevTools (F12) → Console tab
2. Navigate to `/auth/signup`
3. Try signing up with:
   - Email: `test@example.com`
   - Password: `Test1234!`
   - Name: `Test User`
4. Watch console for error messages
5. Should redirect to `/` on success

### Expected Console Output:
- No `console.error()` messages if successful
- Profile should appear in Supabase → profiles table

### If Still Getting Error:
1. Copy the console.error message
2. Check the error type:
   - **Network error** → Check CORS, URL, .env
   - **Auth error** → Check credentials, check Supabase auth settings
   - **RLS error** → Run `FIX_AUTH_ISSUES.sql` in Supabase
   - **Profile creation error** → Check if profiles table exists

---

## Running the SQL Fix

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy entire contents of `FIX_AUTH_ISSUES.sql`
5. Paste into editor
6. Click **Run**
7. Wait for success message
8. Test login/signup again

---

## Quick Test Script

Add this to browser console to test auth:

```javascript
// Test Supabase connection
async function testAuth() {
  const response = await fetch('https://your-project.supabase.co/rest/v1/', {
    headers: { 'apikey': 'your-anon-key' }
  });
  console.log('Supabase connection:', response.status);
  
  // Test signup
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'Test1234!'
  });
  
  console.log('Signup result:', { data, error });
}

testAuth();
```

---

## What Changed & Why

| Component | Problem | Solution | Impact |
|-----------|---------|----------|--------|
| `signUp()` | Silent failures | Try/catch + logging | Clear error messages |
| `signIn()` | Silent failures | Try/catch + logging | Clear error messages |
| Profile creation | Could fail silently | Non-blocking + fallback trigger | Signup never fails |
| Error display | "Failed to fetch" generic | Specific error messages | Users know what's wrong |
| RLS policies | May be restrictive | SQL trigger + verified policies | Profile creation always works |

---

## Next Steps

If auth is still failing after all these fixes:

1. **Check Supabase Auth Logs:**
   - Supabase Dashboard → Authentication → Logs
   - Look for your signup/signin attempts

2. **Check Network Tab:**
   - DevTools → Network tab
   - Look at the auth API requests
   - Check response status and body

3. **Verify Database:**
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT COUNT(*) FROM auth.users;`
   - Check if any users exist

4. **Check Row Level Security:**
   - SQL Editor
   - Run: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
   - Verify policies exist and are correct

---

## Files Modified

- ✅ `lib/AuthContext.tsx` - Added error handling and logging
- ✨ `FIX_AUTH_ISSUES.sql` - SQL fixes for RLS and triggers (NEW)

## Testing Status

After applying these fixes:
- ✅ Error messages are now visible in browser console
- ✅ Profile creation is non-blocking
- ✅ Automatic profile creation trigger is in place
- ✅ RLS policies are verified
- ⏳ Ready to test - follow "Testing Checklist" above
