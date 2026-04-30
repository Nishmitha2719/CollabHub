# 🚀 QUICK START - AUTH FIX

## 3-Step Quick Fix

### Step 1: Apply Code Fix ✅ DONE
File `lib/AuthContext.tsx` has been updated with:
- Try/catch blocks on all auth functions
- console.error() logging throughout
- Proper error handling

### Step 2: Apply SQL Fix 
**In Supabase Dashboard:**
1. Go to SQL Editor
2. New Query
3. Paste contents of `FIX_AUTH_ISSUES.sql`
4. Click Run

### Step 3: Test
1. Restart dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Open DevTools console: `F12`
4. Sign up with test email
5. Should work or show clear error in console

---

## ✅ What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Error messages** | "Failed to fetch" | Specific error details |
| **Error logging** | Silent failures | console.error shows everything |
| **Profile creation** | Could fail silently | Non-blocking with fallback |
| **Network errors** | Uncaught | Caught and logged |
| **RLS violations** | Hidden | Logged with details |

---

## 🔍 Testing

### Test 1: Sign Up
```
1. Navigate to /auth/signup
2. Enter: email@example.com, password, name
3. Click Sign Up
4. Open DevTools console (F12)
5. Should redirect home (success) or show error
```

### Test 2: Sign In
```
1. Navigate to /auth/login
2. Enter: email from step 1, password
3. Click Sign In
4. Should redirect home or show error in console
```

### Test 3: Check Profile Created
```
1. Go to Supabase Dashboard
2. SQL Editor
3. Run: SELECT * FROM profiles;
4. Should see your test profile with role='user'
```

---

## 🐛 If Something Goes Wrong

### Error in Console?
1. Read the exact error message
2. Check `AUTH_FIX_GUIDE.md` for that error
3. Most common: CORS, RLS, or wrong credentials

### No Error, Just "Failed to Fetch"?
1. Restart dev server
2. Check `.env.local` has correct URL and key
3. Run `FIX_AUTH_ISSUES.sql` again

### Profile Not Appearing?
1. Check Supabase auth.users table
2. Verify user was created
3. Check console.error for profile creation error
4. Run `FIX_AUTH_ISSUES.sql` to enable auto-trigger

---

## 📋 Checklist

Before testing:
- [ ] Code changes applied to `lib/AuthContext.tsx`
- [ ] `.env.local` has correct SUPABASE_URL and ANON_KEY
- [ ] SQL script `FIX_AUTH_ISSUES.sql` has been run in Supabase
- [ ] Dev server is running: `npm run dev`

When testing:
- [ ] Open DevTools console before testing: `F12` → Console
- [ ] Test sign up flow
- [ ] Check for errors in console
- [ ] Verify profile in database
- [ ] Test sign in flow
- [ ] Check session is saved

---

## 💬 Key Points

✅ **Errors are now logged** - Open console to see what's wrong
✅ **Profile creation is safe** - Won't break signup even if it fails
✅ **Automatic fallback** - Backend trigger creates profile if needed
✅ **RLS policies verified** - SQL script ensures auth works

---

## 📞 Common Commands

```bash
# Restart dev server
npm run dev

# Check if packages installed
npm list @supabase/supabase-js

# Build to check for errors
npm run build
```

---

## ✨ Next: Full Guide

Read `AUTH_FIX_GUIDE.md` for detailed debugging if issues persist.
